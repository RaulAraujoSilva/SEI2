import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Navigation } from "@/components/layout/navigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SEI Manager - Sistema de Importação de Processos",
  description: "Sistema para importação e acompanhamento de processos SEI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Navigation>
          {children}
        </Navigation>
      </body>
    </html>
  )
}
