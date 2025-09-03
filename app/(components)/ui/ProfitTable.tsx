'use client'
import { useState, useMemo } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { RefreshCw, Download, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortField = 'purchase_time' | 'sell_time' | 'profit' | 'buy_price' | 'symbol'
type SortDirection = 'asc' | 'desc'

export function ProfitTable() {
  const { profitTable, portfolioLoading, fetchProfitTable, exportProfitTable } = useDerivStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)
  const [sortField, setSortField] = useState<SortField>('purchase_time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const totalPnL = useMemo(() =>
    profitTable.reduce((sum, transaction) => sum + (transaction.profit || 0), 0),
    [profitTable]
  )

  const winRate = useMemo(() => {
    if (profitTable.length === 0) return 0
    const wins = profitTable.filter(t => (t.profit || 0) > 0).length
    return Math.round((wins / profitTable.length) * 100)
  }, [profitTable])

  const sortedAndPaginatedData = useMemo(() => {
    const sorted = [...profitTable].sort((a, b) => {
      const aValue = a[sortField] || 0
      const bValue = b[sortField] || 0

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return sorted.slice(startIndex, endIndex)
  }, [profitTable, sortField, sortDirection, currentPage, pageSize])

  const totalPages = Math.ceil(profitTable.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />
    return sortDirection === 'asc' ?
      <ArrowUp className="h-3 w-3" /> :
      <ArrowDown className="h-3 w-3" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Trading History</h3>
        <div className="flex gap-2">
          <button
            onClick={() => fetchProfitTable(pageSize, (currentPage - 1) * pageSize)}
            disabled={portfolioLoading}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${portfolioLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={exportProfitTable}
            disabled={profitTable.length === 0}
            className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 hover:bg-white/20 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold">{profitTable.length}</div>
          <div className="text-xs opacity-70">Total Trades</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {totalPnL.toFixed(2)}
          </div>
          <div className="text-xs opacity-70">Total P&L</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{winRate}%</div>
          <div className="text-xs opacity-70">Win Rate</div>
        </div>
        <div className="rounded-xl bg-black/20 p-3 text-center">
          <div className="text-2xl font-bold">
            {profitTable.length > 0 ? (totalPnL / profitTable.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-xs opacity-70">Avg P&L/Trade</div>
        </div>
      </div>

      {/* Profit Table */}
      {profitTable.length === 0 ? (
        <div className="rounded-xl bg-black/20 p-8 text-center text-sm opacity-70">
          No trading history available. Complete some trades to see your history here.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3">
                    <button
                      onClick={() => handleSort('purchase_time')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Purchase Time <SortIcon field="purchase_time" />
                    </button>
                  </th>
                  <th className="text-left p-3">
                    <button
                      onClick={() => handleSort('symbol')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Symbol <SortIcon field="symbol" />
                    </button>
                  </th>
                  <th className="text-left p-3">Contract Type</th>
                  <th className="text-right p-3">
                    <button
                      onClick={() => handleSort('buy_price')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Buy Price <SortIcon field="buy_price" />
                    </button>
                  </th>
                  <th className="text-right p-3">Sell Price</th>
                  <th className="text-right p-3">
                    <button
                      onClick={() => handleSort('profit')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      P&L <SortIcon field="profit" />
                    </button>
                  </th>
                  <th className="text-left p-3">
                    <button
                      onClick={() => handleSort('sell_time')}
                      className="flex items-center gap-1 hover:opacity-80"
                    >
                      Sell Time <SortIcon field="sell_time" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndPaginatedData.map((transaction) => (
                  <tr key={transaction.contract_id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <div className="font-medium">
                        {new Date(transaction.purchase_time * 1000).toLocaleDateString()}
                      </div>
                      <div className="text-xs opacity-60">
                        {new Date(transaction.purchase_time * 1000).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{transaction.symbol}</div>
                      <div className="text-xs opacity-60">ID: {transaction.contract_id}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-white/10 px-2 py-1 text-xs">
                        {transaction.contract_type}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium">{transaction.buy_price?.toFixed(2)}</div>
                      <div className="text-xs opacity-60">{transaction.currency}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-medium">{transaction.sell_price?.toFixed(2) || '—'}</div>
                    </td>
                    <td className="p-3 text-right">
                      <div className={`font-medium ${
                        (transaction.profit || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {transaction.profit?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="p-3">
                      {transaction.sell_time ? (
                        <>
                          <div className="font-medium">
                            {new Date(transaction.sell_time * 1000).toLocaleDateString()}
                          </div>
                          <div className="text-xs opacity-60">
                            {new Date(transaction.sell_time * 1000).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs opacity-60">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm opacity-70">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, profitTable.length)} of {profitTable.length} entries
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="rounded bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
