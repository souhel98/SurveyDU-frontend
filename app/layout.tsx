import "./globals.css"
import { Cairo } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import RoutePreloader from "@/components/ui/RoutePreloader"
import { LoaderProvider } from "@/components/ui/LoaderContext"

const cairo = Cairo({ 
  subsets: ["latin", "arabic"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-cairo"
})

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
      <body className={`${cairo.variable} font-cairo`}>
        <LoaderProvider>
          <RoutePreloader />
          {children}
          <Toaster />
        </LoaderProvider>
      </body>
    </html>
  )
}
