import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    })
  ],

  callbacks: {
    async signIn({ user }: any) {
      await connectDB()

      let dbUser = await User.findOne({ email: user.email })

      if (!dbUser) {
        dbUser = await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
        })
      } else {
        // update user if anything changed
        dbUser.name = user.name
        dbUser.image = user.image
        await dbUser.save()
      }

      return true
    },

    async session({ session }: any) {
      await connectDB()

      const dbUser = await User.findOne({
        email: session.user.email
      })

      if (!dbUser) return session; // Safety check

      // 🔥 THE FIX: Ensure this is a string and remove the redundant second line
      session.user.id = dbUser._id.toString()
      
      // Attach other stats
      session.user.xp = dbUser.xp || 0
      session.user.level = dbUser.level || 1
      session.user.streak = dbUser.streak || 0

      return session
    }
  }
}