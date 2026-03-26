import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth.ts"
import { redirect } from "next/navigation"
import LoginClient from "./LoginClient"

export default async function LoginPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/")
  }

  return <LoginClient />
}