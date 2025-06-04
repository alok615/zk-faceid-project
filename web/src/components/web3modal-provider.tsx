'use client'

import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { WagmiProvider } from 'wagmi'
import { mainnet, sepolia, baseSepolia } from 'viem/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'dfc330e7a14d49c7fc6638ce9594ef54'

// 2. Create wagmiConfig
const metadata = {
  name: 'ZK Face ID Project',
  description: 'Face verification with zero-knowledge proofs',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const chains = [baseSepolia, mainnet, sepolia] as const

const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

// 3. Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  enableOnramp: true // Optional - false as default
})

// 4. Create query client
const queryClient = new QueryClient()

interface Web3ModalProviderProps {
  children: ReactNode
}

export function Web3ModalProvider({ children }: Web3ModalProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}