'use client'
import { useDerivStore } from '@/state/derivStore'
import { RefreshCw, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export function PortfolioTable() {
  const { portfolio, portfolioLoading, refreshPortfolio, sellContract } = useDerivStore()

  const totalPnL = portfolio.reduce((sum, contract) => sum + (contract.profit || 0), 0)
  const winningPositions = portfolio.filter(c => (c.profit || 0) > 0).length
  const losingPositions = portfolio.filter(c => (c.profit || 0) < 0).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Open Positions</h3>
        <button
          onClick={refreshPortfolio}
          disabled={portfolioLoading}
          className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${portfolioLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{portfolio.length}</div>
          <div className="text-xs opacity-70">Open Positions</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL.toFixed(2)}
          </div>
          <div className="text-xs opacity-70">Total P&L</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{winningPositions}</div>
          <div className="text-xs opacity-70">Winning</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{losingPositions}</div>
          <div className="text-xs opacity-70">Losing</div>
        </div>
      </div>

      {/* Portfolio Table */}
      {portfolio.length === 0 ? (
        <div className="rounded-xl bg-black/20 p-8 text-center text-sm opacity-70">
          No open positions. Start trading to see your portfolio here.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-3">Contract</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Buy Price</th>
                <th className="text-right p-3">Current</th>
                <th className="text-right p-3">P&L</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((contract) => (
                <tr key={contract.contract_id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3">
                    <div className="font-medium">{contract.display_name || contract.symbol}</div>
                    <div className="text-xs opacity-60">ID: {contract.contract_id}</div>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-white/10 px-2 py-1 text-xs">
                      {contract.contract_type}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium">{contract.buy_price?.toFixed(2)}</div>
                    <div className="text-xs opacity-60">{contract.currency}</div>
                  </td>
                  <td className="p-3 text-right">
                    <div className="font-medium">{contract.current_spot?.toFixed(5) || '—'}</div>
                  </td>
                  <td className="p-3 text-right">
                    <div className={`font-medium flex items-center justify-end gap-1 ${
                      (contract.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {(contract.profit || 0) >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {contract.profit?.toFixed(2) || '0.00'}
                    </div>
                    {contract.profit_percentage && (
                      <div className="text-xs opacity-60">
                        ({contract.profit_percentage > 0 ? '+' : ''}{contract.profit_percentage.toFixed(2)}%)
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      contract.status === 'open' ? 'bg-emerald-500/20 text-emerald-400' :
                      contract.status === 'sold' ? 'bg-gray-500/20 text-gray-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {contract.status || 'unknown'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    {contract.status === 'open' && (
                      <button
                        onClick={() => sellContract(contract.contract_id)}
                        className="rounded bg-red-600 px-3 py-1 text-xs hover:bg-red-700"
                      >
                        Sell
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
