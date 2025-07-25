import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import RoutePreloader from "@/components/ui/RoutePreloader"
import { LoaderProvider } from "@/components/ui/LoaderContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SurveyDU - University Survey System",
  description: "A comprehensive survey system for Damascus University",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LoaderProvider>
          <RoutePreloader />
          {children}
          <Toaster />
        </LoaderProvider>
      </body>
    </html>
  )
}
