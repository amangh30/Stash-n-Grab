import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import UserCollection from "@/models/UserCollection";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { collectionId } = await req.json();
    await connectDB();

    // Remove the link between this user and the collection
    const result = await UserCollection.findOneAndDelete({
      userId: session.user.id,
      collectionId: collectionId,
    });

    if (!result) {
      return NextResponse.json({ error: "Path not found in your vault" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Path removed from vault" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to unstash" }, { status: 500 });
  }
}