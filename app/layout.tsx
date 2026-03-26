import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ThemeToggle from "./component/ThemeToggle" // Adjust path if needed
import AuthProvider from "./provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Stash n Grab",
  description: "Your digital vault for knowledge.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          {/* This floating toggle will now appear on EVERY page.
            You can now remove the button and theme logic from LoginPage.tsx!
          */}
          <ThemeToggle />
          
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}