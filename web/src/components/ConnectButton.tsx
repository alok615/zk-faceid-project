'use client'

import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { useState, useEffect } from 'react'

export function ConnectButton() {
  const { open } = useWeb3Modal()
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by only rendering after client mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      // Standard wagmi disconnect
      disconnect()
      
      // Clear Web3Modal and WalletConnect storage
      if (typeof window !== 'undefined') {
        // Web3Modal storage
        const web3ModalKeys = ['w3m-wallet', 'w3m-account', 'w3m-connector', 'w3m-ethereum-provider']
        web3ModalKeys.forEach(key => {
          localStorage.removeItem(key)
          sessionStorage.removeItem(key)
        })
        
        // WalletConnect storage cleanup
        Object.keys(localStorage).forEach(key => {
          if (
            key.startsWith('wc@') || 
            key.startsWith('@walletconnect') || 
            key.startsWith('walletconnect') ||
            key.includes('walletconnect')
          ) {
            localStorage.removeItem(key)
          }
        })
        
        // Clear any remaining Web3Modal state
        localStorage.removeItem('wagmi.store')
        localStorage.removeItem('wagmi.connected')
      }
      
      // Force a small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Optional: force page reload for complete cleanup
      // window.location.reload()
      
    } catch (error) {
      console.error('Disconnect error:', error)
    } finally {
      setIsDisconnecting(false)
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr || addr.length < 10) return addr
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted) {
    return (
      <div suppressHydrationWarning={true}>
        <button
          disabled
          className="px-6 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg cursor-not-allowed opacity-50"
        >
          Loading...
        </button>
      </div>
    )
  }

  // Client-side only rendering after mount
  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4" suppressHydrationWarning={true}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-gray-300">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={isDisconnecting}
          className={`
            px-4 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200
            ${isDisconnecting 
              ? 'bg-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-red-600 hover:bg-red-700 hover:scale-105'
            }
          `}
        >
          {isDisconnecting ? (
            <span className="flex items-center gap-2">
              <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
              Disconnecting...
            </span>
          ) : (
            'Disconnect'
          )}
        </button>
      </div>
    )
  }

  // Show connect button
  return (
    <div suppressHydrationWarning={true}>
      <button
        onClick={() => {
          try {
            open()
          } catch (error) {
            console.error('Web3Modal open error:', error)
          }
        }}
        disabled={isConnecting}
        className={`
          px-6 py-2 text-sm font-medium text-white rounded-lg transition-all duration-200
          ${isConnecting 
            ? 'bg-gray-600 cursor-not-allowed opacity-50' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg'
          }
        `}
      >
        {isConnecting ? (
          <span className="flex items-center gap-2">
            <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
            Connecting...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>
    </div>
  )
}

// Export as default for dynamic import compatibility
export default ConnectButton
