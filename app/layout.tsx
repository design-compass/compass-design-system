import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata = {
  title: "COMPASS - Preferences example",
  description: "A local, synthetic preferences form built with public COMPASS components.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
