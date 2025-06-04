import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Web3ModalProvider } from '@/components/web3modal-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ZK Face ID Project',
  description: 'Face verification with zero-knowledge proofs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Web3ModalProvider>
          {children}
        </Web3ModalProvider>
      </body>
    </html>
  )
}