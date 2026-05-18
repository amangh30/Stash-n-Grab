// components/BackLink.tsx
'use client'

import { useState } from "react";
import Link from "next/link";

export default function BackLink() {
  const [isClicked, setIsClicked] = useState(false);

  return (
    <Link 
      href="/" 
      onClick={() => setIsClicked(true)}
      className="text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white transition font-bold text-sm flex items-center gap-2 mb-10"
    >
      {isClicked ? (
        <svg 
          className="animate-spin h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        <span>←</span>
      )}
      Back to Vault
    </Link>
  );
}