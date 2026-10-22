import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Football Lobby',
  description: 'Organise pickup football games',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body
        className="bg-white text-gray-900 antialiased"
        style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" }}
      >
        <div className="min-h-screen">
          <div className="max-w-md mx-auto px-4 py-5">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}
