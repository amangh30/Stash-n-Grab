import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"

// Handles: PATCH /api/collections/[id]
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await props.params;
  const { title, description, sections } = await req.json();

  await connectDB();

  try {
    const col = await Collection.findById(id);
    if (!col) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

    if (col.createdBy.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    col.title = title || col.title;
    col.description = description || col.description;

    const newSectionIds = [];

    if (sections) {
      for (const sData of sections) {
        let section;
        if (sData._id && sData._id.length > 10) {
          section = await Section.findByIdAndUpdate(
            sData._id,
            { title: sData.title, questions: sData.questions },
            { new: true }
          );
        } else {
          section = await Section.create({
            title: sData.title,
            collectionId: col._id,
            questions: sData.questions || [],
          });
        }

        const newResourceIds = [];
        if (sData.resources) {
          for (const rData of sData.resources) {
            if (rData._id && rData._id.length > 10) {
              const res = await Resource.findByIdAndUpdate(
                rData._id,
                { title: rData.title, link: rData.link },
                { new: true }
              );
              newResourceIds.push(res._id);
            } else {
              const res = await Resource.create({
                ...rData,
                sectionId: section._id,
                createdBy: session.user.id,
              });
              newResourceIds.push(res._id);
            }
          }
        }

        section.resources = newResourceIds;
        await section.save();
        newSectionIds.push(section._id);
      }
      col.sections = newSectionIds;
    }

    await col.save();

    const updatedTree = await Collection.findById(col._id).populate({
      path: "sections",
      populate: { path: "resources" },
    });

    return NextResponse.json(updatedTree);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}