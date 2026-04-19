import { connectDB } from "@/lib/mongodb"
import Collection from "@/models/Collection"
import Section from "@/models/Section"
import Resource from "@/models/Resource"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import DiscussionPortal from "../../component/DiscussionPortal" 
import CurriculumViewer from "@/app/component/CurriculumViewer"
import UserResource from "@/models/UserResource"

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({ params }: any) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  const plainUser = session?.user ? {
    id: session.user.id?.toString(), // Explicitly convert the ObjectId buffer to a string
    name: session.user.name,
    image: session.user.image,
    // Add xp/level/streak if they are in your session object
    xp: session.user.xp,
    level: session.user.level,
    streak: session.user.streak,
  } : null;

  await connectDB()

  const col = await Collection.findById(id)
    .populate({
      path: 'sections',
      model: Section,
      populate: { path: 'resources', model: Resource }
    })
    .lean();

  let userProgress: any[] = [];
  if (session?.user?.id) {
    const resourceIds = col.sections.flatMap((s: any) => s.resources.map((r: any) => r._id));
    userProgress = await UserResource.find({
      userId: session.user.id,
      resourceId: { $in: resourceIds }
    }).lean();
  }

  const plainCol = JSON.parse(JSON.stringify(col));
  const plainProgress = JSON.parse(JSON.stringify(userProgress));

  if (!col) return notFound();

  return (
    <div className="min-h-screen bg-[#0b0b0f] text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-gray-500 hover:text-white transition font-bold text-sm flex items-center gap-2 mb-10">
          ← Back to Vault
        </Link>

        <header className="mt-10 mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-purple-500/30">
              {col.sections?.length || 0} Modules
            </span>
            
            {/* 🔥 Rating Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-yellow-500/20">
              ⭐ {col.ratings?.average?.toFixed(1) || "0.0"} ({col.ratings?.count || 0})
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
            {col.title}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
            {col.description}
          </p>
        </header>

        <CurriculumViewer 
        collection={plainCol} 
        initialProgress={plainProgress} 
        user={session?.user} 
      />

        {/* 🔥 DISCUSSION PORTAL SECTION */}
        <div className="mt-32 pt-16 border-t border-white/5">
        <DiscussionPortal 
          collectionId={col._id.toString()} 
          user={plainUser} // Use the flattened object here
        />
      </div>
      </div>
    </div>
  )
}