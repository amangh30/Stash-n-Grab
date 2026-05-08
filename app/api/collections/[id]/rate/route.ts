import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Collection from "@/models/Collection";
import UserSection from "@/models/UserSection";
import UserRating from "@/models/UserRating"; // 🔥 Import the new model

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await props.params;
  const { rating } = await req.json();

  await connectDB();

  try {
    // 1. DUPLICATION CHECK: Has this user already rated?
    const existingRating = await UserRating.findOne({
      userId: session.user.id,
      collectionId: id
    });

    if (existingRating) {
      return NextResponse.json({ error: "You have already rated this path." }, { status: 403 });
    }

    // 2. VERIFICATION: Ensure 100% completion (as before)
    const col = await Collection.findById(id).populate("sections");
    const passedExamsCount = await UserSection.countDocuments({
      userId: session.user.id,
      sectionId: { $in: col.sections.map((s: any) => s._id) },
      examPassed: true
    });

    if (passedExamsCount < col.sections.length) {
      return NextResponse.json({ error: "Master the path before rating!" }, { status: 403 });
    }

    // 3. LOG THE RATING: Create the record first
    await UserRating.create({
      userId: session.user.id,
      collectionId: id,
      rating
    });

    // 4. ATOMIC UPDATE: Update Collection stats
    const updatedCol = await Collection.findOneAndUpdate(
      { _id: id },
      [
        {
          $set: {
            "ratings.sum": { $add: [{ $ifNull: ["$ratings.sum", 0] }, rating] },
            "ratings.count": { $add: [{ $ifNull: ["$ratings.count", 0] }, 1] }
          }
        },
        {
          $set: {
            "ratings.average": { $divide: ["$ratings.sum", "$ratings.count"] }
          }
        }
      ],
      { new: true, updatePipeline: true }
    );

    return NextResponse.json(updatedCol.ratings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  await connectDB()
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 9
  const skip = (page - 1) * limit

  // Constants for Weighted Score
  const m = 5;      // Minimum ratings to be weighted heavily
  const C = 3.5;    // Global average across the site (fallback)

  try {
    const pipeline: any[] = []

    // 1. Text Search Match
    if (search.trim()) {
      pipeline.push({ 
        $match: { $text: { $search: search } } 
      })
    } else {
      pipeline.push({ $match: {} })
    }

    // 2. Add Weighted Score Field
    // Formula: ( (avg * count) + (C * m) ) / (count + m)
    pipeline.push({
      $addFields: {
        weightedScore: {
          $divide: [
            {
              $add: [
                { $multiply: [{ $ifNull: ["$ratings.average", 0] }, { $ifNull: ["$ratings.count", 0] }] },
                (C * m)
              ]
            },
            { $add: [{ $ifNull: ["$ratings.count", 0] }, m] }
          ]
        },
        // Capture text score if searching
        searchScore: search ? { $meta: "textScore" } : 0
      }
    })

    // 3. Sorting Logic
    if (search) {
      // Search relevance first, then weighted quality
      pipeline.push({ $sort: { searchScore: -1, weightedScore: -1 } })
    } else {
      // Quality and freshness
      pipeline.push({ $sort: { weightedScore: -1, createdAt: -1 } })
    }

    // 4. Pagination & Populate
    pipeline.push({ $skip: skip })
    pipeline.push({ $limit: limit })

    // Execute Aggregation
    const collections = await Collection.aggregate(pipeline)

    // Manual population (since .populate() doesn't work directly on aggregate results)
    // You can also use $lookup in the pipeline, but this is simpler for now:
    const populated = await Collection.populate(collections, { 
      path: "sections createdBy",
      select: "title name image"
    })

    // 5. Get Total Count for hasMore
    const totalCount = await Collection.countDocuments(search ? { $text: { $search: search } } : {})
    const hasMore = skip + collections.length < totalCount

    return NextResponse.json({ 
      collections: JSON.parse(JSON.stringify(populated)), 
      hasMore 
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}