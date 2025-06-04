import { ConnectButton } from '@/components/ConnectButton'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          ZK Face ID Project
        </h1>
        
        <div className="flex justify-center">
          <ConnectButton />
        </div>
        
        <div className="mt-8 text-center text-gray-600">
          <p>Connect your wallet to interact with the face verification system</p>
        </div>
      </div>
    </main>
  )
}