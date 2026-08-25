import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const { title, description, sections } = await req.json()

  try {
    const newCollection = await Collection.create({
      title,
      description,
      createdBy: session.user.id,
    })

    const sectionIds = []

    if (sections && sections.length > 0) {
      for (const sectionData of sections) {
        const newSection = await Section.create({
          title: sectionData.title,
          collectionId: newCollection._id,
          questions: sectionData.questions || [],
        })

        sectionIds.push(newSection._id)

        const resourceIds = []

        if (
          sectionData.resources &&
          sectionData.resources.length > 0
        ) {
          for (const resData of sectionData.resources) {
            const newResource = await Resource.create({
              ...resData,
              sectionId: newSection._id,
              createdBy: session.user.id,
            })

            resourceIds.push(newResource._id)
          }
        }

        newSection.resources = resourceIds
        await newSection.save()
      }
    }

    newCollection.sections = sectionIds
    await newCollection.save()

    const fullTree = await Collection.findById(newCollection._id)
      .populate({
        path: "sections",
        populate: {
          path: "resources",
        },
      })

    return NextResponse.json(fullTree)
  } catch (err: any) {
    console.error("Deep Create Error:", err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)

  const search = searchParams.get("search") || ""
  const page = Math.max(
    parseInt(searchParams.get("page") || "1", 10),
    1
  )

  const limit = 9
  const skip = (page - 1) * limit

  const m = 5
  const C = 3.5

  try {
    const pipeline: any[] = []

    if (search.trim()) {
      pipeline.push({
        $match: {
          $text: {
            $search: search.trim(),
          },
        },
      })
    } else {
      pipeline.push({
        $match: {},
      })
    }

    pipeline.push({
      $addFields: {
        weightedScore: {
          $divide: [
            {
              $add: [
                {
                  $multiply: [
                    {
                      $ifNull: ["$ratings.average", 0],
                    },
                    {
                      $ifNull: ["$ratings.count", 0],
                    },
                  ],
                },
                C * m,
              ],
            },
            {
              $add: [
                {
                  $ifNull: ["$ratings.count", 0],
                },
                m,
              ],
            },
          ],
        },
        ...(search.trim()
          ? {
              searchScore: {
                $meta: "textScore",
              },
            }
          : {}),
      },
    })

    if (search.trim()) {
      pipeline.push({
        $sort: {
          searchScore: -1,
          weightedScore: -1,
          createdAt: -1,
        },
      })
    } else {
      pipeline.push({
        $sort: {
          weightedScore: -1,
          createdAt: -1,
        },
      })
    }

    pipeline.push({
      $skip: skip,
    })

    pipeline.push({
      $limit: limit,
    })

    const collections = await Collection.aggregate(pipeline)

    const populated = await Collection.populate(collections, [
      {
        path: "sections",
        model: Section,
        populate: {
          path: "resources",
          model: Resource,
        },
      },
      {
        path: "createdBy",
        select: "name image",
      },
    ])

    const countQuery = search.trim()
      ? {
          $text: {
            $search: search.trim(),
          },
        }
      : {}

    const totalCount = await Collection.countDocuments(countQuery)

    const hasMore = skip + collections.length < totalCount

    return NextResponse.json({
      collections: JSON.parse(JSON.stringify(populated)),
      hasMore,
    })
  } catch (err: any) {
    console.error("Collection GET Error:", err)

    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}