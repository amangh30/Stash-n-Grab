"use client"

import { FcGoogle } from "react-icons/fc"
import Logo from "../../component/ui/logo"
import { FaGithub } from "react-icons/fa"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      
      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Stash-n-Grab
          </h1>
          <p className="text-lg text-white/80">
            Save your resources, track your progress, and build your knowledge — all in one place.
          </p>

          <div className="mt-10 space-y-3 text-white/70 text-sm">
            <p>📦 Organize your learning</p>
            <p>📊 Track your progress</p>
            <p>🚀 Stay consistent</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600 px-4">
        
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 transition hover:shadow-2xl">
          
          <div className="text-center mb-8 flex flex-col items-center">
            <Logo size={50} />
            <h1 className="text-3xl font-bold mt-3 text-black">Stash-N-Grab</h1>
            <p className="text-sm text-gray-600 mt-1">
              Store. Track. Grow.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            
            <button className="flex items-center justify-center gap-3 w-full border border-gray-300 rounded-lg p-3 hover:bg-gray-100 transition duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
              <FcGoogle size={20} />
              <span className="font-medium text-black">Continue with Google</span>
            </button>

            <button className="flex items-center justify-center gap-3 w-full bg-black text-white rounded-lg p-3 hover:opacity-90 transition duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
              <FaGithub size={20} />
              <span className="font-medium">Continue with GitHub</span>
            </button>

          </div>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing in, you agree to our Terms & Privacy Policy
          </p>
        </div>

      </div>
    </div>
  )
}