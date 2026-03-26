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
}