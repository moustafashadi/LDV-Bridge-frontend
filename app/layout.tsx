import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Auth0ProviderWithNavigate } from "@/components/providers/auth0-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { WebSocketProvider } from "@/components/providers/websocket-provider"
import { AuthTokenManager } from "@/components/providers/auth-token-manager"
import { ToastProvider } from "@/components/notifications/toast-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LDV-Bridge Platform",
  description: "Governance and version control for low-code/no-code applications",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <Auth0ProviderWithNavigate>
          <AuthTokenManager>
            <QueryProvider>
              <WebSocketProvider>
                <ToastProvider>
                  {children}
                  <Toaster />
                </ToastProvider>
              </WebSocketProvider>
            </QueryProvider>
          </AuthTokenManager>
        </Auth0ProviderWithNavigate>
      </body>
    </html>
  )
}
