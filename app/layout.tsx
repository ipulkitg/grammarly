import "./globals.css"
import { Merriweather } from "next/font/google"
import { AuthProvider } from "@/components/providers/auth-provider"

const diaryFont = Merriweather({ subsets: ["latin"], weight: ["400", "700"] })

export const metadata = {
  title: "SOP Tool",
  description: "A tool for writing and improving Statements of Purpose",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${diaryFont.className} font-serif`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            <main className="flex-1 w-full">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
