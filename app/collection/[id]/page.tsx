// CollectionDetailPage.tsx
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
import UserCollection from "@/models/UserCollection";
import UserSection from "@/models/UserSection";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({ params }: any) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  
  await connectDB()

  const col = await Collection.findById(id)
    .populate({
      path: 'sections',
      model: Section,
      populate: { path: 'resources', model: Resource }
    })
    .lean();

  if (!col) return notFound();

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

  const plainUser = session?.user ? {
    id: session.user.id ? String(session.user.id) : null,
    name: session.user.name || null,
    email: session.user.email || null,
    image: session.user.image || null,
    xp: session.user.xp || 0,
    level: session.user.level || 1,
    streak: session.user.streak || 0,
  } : null;

  let passedExams: any[] = [];
  if (session?.user?.id) {
    const sectionIds = col.sections.map((s: any) => s._id);
    passedExams = await UserSection.find({
      userId: session.user.id,
      sectionId: { $in: sectionIds },
      examPassed: true
    }).lean();
  }

  const plainPassedExams = JSON.parse(JSON.stringify(passedExams));

  let isStashed = false;
  if (session?.user?.id) {
    const stashCheck = await UserCollection.findOne({ 
      userId: session.user.id, 
      collectionId: id 
    });
    isStashed = !!stashCheck;
  }

  if (!col) return notFound();

  return (
    // 1. Removed hardcoded bg-[#0b0b0f]. Let global.css body vars handle the background.
    <div className="min-h-screen py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        {/* 2. Back Link: Slate for Light, Gray/White for Dark */}
        <Link href="/" className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition font-bold text-sm flex items-center gap-2 mb-10">
          ← Back to Vault
        </Link>

        <header className="mt-10 mb-16">
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* 3. Module Badge: High contrast purple for Light mode */}
            <span className="px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 text-[10px] font-black uppercase tracking-widest rounded-lg">
              {col.sections?.length || 0} Modules
            </span>
            
            {/* 4. Rating Badge: High contrast yellow for Light mode */}
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-600 dark:dark:text-yellow-500 dark:border-yellow-500/20 text-[10px] font-black uppercase tracking-widest rounded-lg">
              ⭐ {col.ratings?.average?.toFixed(1) || "0.0"} ({col.ratings?.count || 0})
            </div>
          </div>

          {/* 5. Title: Slate-900 for Light Mode visibility */}
          <h1 className="text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-gray-500 bg-clip-text text-transparent">
            {col.title}
          </h1>
          
          {/* 6. Description: Slate-600 for Light mode */}
          <p className="text-xl text-slate-600 dark:text-gray-400 max-w-2xl leading-relaxed">
            {col.description}
          </p>
        </header>

        <CurriculumViewer 
        collection={plainCol} 
        initialProgress={plainProgress} 
        user={plainUser} 
        passedExams={plainPassedExams}
        isStashed={isStashed}
      />

        {/* 7. Discussion Divider: Slate-200 for Light mode */}
        <div className="mt-32 pt-16 border-t border-slate-200 dark:border-white/5">
          <DiscussionPortal 
            collectionId={col._id.toString()} 
            user={plainUser}
          />
        </div>
      </div>
    </div>
  )
}