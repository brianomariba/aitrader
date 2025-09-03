'use client'
import { useDerivStore } from '@/state/derivStore'
import { LogPanel } from './LogPanel'

export function ConnectionPanel() {
  const { connected, token, setToken, connect, disconnect, authorize, fetchActiveSymbols, account, getOAuthUrl } = useDerivStore()
  const enforceOAuth = process.env.NEXT_PUBLIC_ENFORCE_OAUTH === '1'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">C</span>
        </div>
        <h2 className="text-xl font-semibold text-white">Connection</h2>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-300">Status</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${connected ? 'text-green-400' : 'text-red-400'}`}>
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {account && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-300">Account</span>
            <span className="text-sm font-medium text-white">{account.loginid}</span>
          </div>
        )}

        {account?.balance && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Balance</span>
            <span className="text-sm font-medium profit-positive">
              ${account.balance.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Connection Controls */}
      <div className="grid grid-cols-1 gap-3">
        <button className="btn-primary flex items-center justify-center gap-2" onClick={connect}>
          <span>Connect to Deriv</span>
        </button>

        <a className="btn-secondary text-center" href={getOAuthUrl()}>
          Login with Deriv OAuth
        </a>

        <button className="btn-secondary" onClick={disconnect}>
          Disconnect
        </button>
      </div>

      {!enforceOAuth && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400 font-medium">API Token (Development Only)</div>
          <input
            className="input-field w-full"
            placeholder="Paste Deriv API token..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary" onClick={authorize}>Authorize</button>
            <button className="btn-secondary" onClick={fetchActiveSymbols}>Get Symbols</button>
          </div>
          <div className="text-xs text-yellow-400 bg-yellow-500/10 p-2 rounded">
            ⚠️ Use OAuth in production for security
          </div>
        </div>
      )}

      {/* Activity Log */}
      <LogPanel />
    </div>
  )
}
