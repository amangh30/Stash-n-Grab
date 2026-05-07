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