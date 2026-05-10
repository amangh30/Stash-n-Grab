"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/");

    const timeout = setTimeout(() => {
      router.replace("/");
    }, 500); // Increased slightly for a smoother visual transition

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-white dark:bg-[#0b0b0f] transition-colors duration-500">
      <div className="flex flex-col items-center gap-8">
        
        {/* Animated Spinner with Glow */}
        <div className="relative">
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
          
          {/* Main Spinner */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="relative h-12 w-12 rounded-full border-4 border-zinc-200 dark:border-white/10 border-t-purple-600 dark:border-t-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.3)]" 
          />
        </div>

        {/* Textual Feedback */}
        <div className="flex flex-col items-center gap-2">
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black uppercase tracking-[0.4em] text-zinc-900 dark:text-white"
          >
            Synchronizing
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.2 }}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400"
          >
            Accessing the Vault
          </motion.p>
        </div>
      </div>
    </div>
  );
}