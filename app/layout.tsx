import type { Metadata } from "next"
import { Cairo } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import RoutePreloader from "@/components/ui/RoutePreloader"
import { LoaderProvider } from "@/components/ui/LoaderContext"
import LocaleProvider from "@/components/ui/locale-provider"

const cairo = Cairo({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SurveyDU - University Survey System",
  description: "A comprehensive survey platform for universities, built with Next.js 14 and ASP.NET Core",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body className={cairo.className}>
        <LocaleProvider>
          <LoaderProvider>
            {children}
            <Toaster />
            <RoutePreloader />
          </LoaderProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
