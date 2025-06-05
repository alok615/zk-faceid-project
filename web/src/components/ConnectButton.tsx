'use client'

import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { useState } from 'react'

export function ConnectButton() {
  const { open } = useWeb3Modal()
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      disconnect()
    } finally {
      setIsDisconnecting(false)
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-mono">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => open()}
      disabled={isConnecting}
      className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  )
}