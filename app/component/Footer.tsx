"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaGithub, FaInstagram, FaLinkedin } from "react-icons/fa"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative z-10 mt-20 border-t border-slate-200 dark:border-white/5 bg-white/30 dark:bg-[#0b0b0f]/30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* BRAND SECTION */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center text-white font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                S
              </div>
              <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                Stash<span className="text-purple-600 font-extrabold">n</span>Grab
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-500 dark:text-gray-400 max-w-xs leading-relaxed">
              Your digital vault for knowledge. Organize resources, track growth, and master your craft with the community.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {["Explore", "Rankings", "Profile", "Guidelines"].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase()}`} 
                    className="text-sm text-slate-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* SOCIALS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-6">
              Connect
            </h4>
            <div className="flex gap-4">
              {[
                { icon: <FaGithub size={20} />, href: "https://www.github.com/amangh30", label: "GitHub" },
                { icon: <FaInstagram size={20} />, href: "https://www.instagram.com/amansinha_30/", label: "Twitter" },
                { icon: <FaLinkedin size={20} />, href: "https://linkedin.com", label: "LinkedIn" }
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-gray-400 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white transition-all shadow-sm"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">
            © {currentYear} Stash-N-Grab. Built for the curious.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-xs text-slate-400 dark:text-gray-500 hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-slate-400 dark:text-gray-500 hover:underline">Terms of Service</Link>
          </div>
        </div>
      </div>
      
      {/* SUBTLE DECORATIVE GRADIENT */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent pointer-events-none" />
    </footer>
  )
}