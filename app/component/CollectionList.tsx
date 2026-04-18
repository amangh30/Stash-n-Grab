"use client"

import { motion, AnimatePresence } from "framer-motion"
import CollectionCard from "./CollectionCard"

export default function CollectionList({ collections, user, savedIds, setUserResources }: any) {
  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500 italic">
        No collections found. Be the first to build one! 🏗️
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      <AnimatePresence mode="popLayout">
        {collections.map((col: any) => (
          <CollectionCard 
            key={col._id} 
            collection={col} 
            user={user} 
            savedIds={savedIds}
            setUserResources={setUserResources}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}