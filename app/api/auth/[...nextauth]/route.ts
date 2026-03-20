import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { connectDB } from "@/lib/mongodb"
import User from "@/models/User"

const handler = NextAuth({
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
    async signIn({ user }) {
      await connectDB()

      const existingUser = await User.findOne({ email: user.email })

      if (!existingUser) {
        await User.create({
          name: user.name,
          email: user.email,
          image: user.image,
        })
      }

      return true
    }
  }
})

export { handler as GET, handler as POST }