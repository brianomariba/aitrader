'use client'
import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { BacktestResult } from '@/lib/backtesting'

interface PerformanceAnalyticsProps {
  results: BacktestResult[]
}

export function PerformanceAnalytics({ results }: PerformanceAnalyticsProps) {
  const [selectedMetric, setSelectedMetric] = useState<'equity' | 'drawdown' | 'returns'>('equity')

  if (results.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Performance Data</h3>
          <p className="text-gray-400">Run a backtest or optimization to see performance analytics</p>
        </div>
      </div>
    )
  }

  // Get the best performing result
  const bestResult = results.reduce((best, current) =>
    current.result.totalReturn > best.result.totalReturn ? current : best
  )

  const metrics = [
    {
      label: 'Total Return',
      value: `${bestResult.result.totalReturn.toFixed(2)}%`,
      color: bestResult.result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400',
      icon: TrendingUp
    },
    {
      label: 'Win Rate',
      value: `${bestResult.result.winRate.toFixed(1)}%`,
      color: 'text-blue-400',
      icon: Target
    },
    {
      label: 'Sharpe Ratio',
      value: bestResult.result.sharpeRatio.toFixed(2),
      color: bestResult.result.sharpeRatio >= 1 ? 'text-green-400' : 'text-yellow-400',
      icon: BarChart3
    },
    {
      label: 'Max Drawdown',
      value: `${bestResult.result.maxDrawdown.toFixed(2)}%`,
      color: bestResult.result.maxDrawdown <= 20 ? 'text-green-400' : 'text-red-400',
      icon: TrendingDown
    }
  ]

  const riskAssessment = () => {
    const result = bestResult.result
    let score = 0
    let issues: string[] = []

    // Win rate assessment
    if (result.winRate >= 60) score += 25
    else if (result.winRate >= 50) score += 15
    else if (result.winRate >= 40) score += 5

    // Sharpe ratio assessment
    if (result.sharpeRatio >= 2) score += 25
    else if (result.sharpeRatio >= 1) score += 15
    else if (result.sharpeRatio >= 0.5) score += 5

    // Max drawdown assessment
    if (result.maxDrawdown <= 10) score += 25
    else if (result.maxDrawdown <= 20) score += 15
    else if (result.maxDrawdown <= 30) score += 10

    // Profit factor assessment
    if (result.profitFactor >= 2) score += 25
    else if (result.profitFactor >= 1.5) score += 15
    else if (result.profitFactor >= 1.2) score += 5

    // Generate issues
    if (result.winRate < 40) issues.push('Low win rate')
    if (result.sharpeRatio < 0.5) issues.push('Poor risk-adjusted returns')
    if (result.maxDrawdown > 30) issues.push('High maximum drawdown')
    if (result.profitFactor < 1.2) issues.push('Low profit factor')

    return { score, issues, grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D' }
  }

  const assessment = riskAssessment()

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Performance Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className={`text-2xl font-bold ${metric.color}`}>{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-medium text-white">Risk Assessment</h4>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold px-2 py-1 rounded ${
                assessment.grade === 'A' ? 'bg-green-500/20 text-green-400' :
                assessment.grade === 'B' ? 'bg-blue-500/20 text-blue-400' :
                assessment.grade === 'C' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                Grade {assessment.grade}
              </span>
              <span className="text-sm text-gray-400">{assessment.score}/100</span>
            </div>
          </div>

          {assessment.issues.length > 0 ? (
            <div className="space-y-2">
              {assessment.issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400">{issue}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400">No significant risk issues detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trading Statistics */}
        <div className="card">
          <h4 className="text-md font-medium text-white mb-3">Trading Statistics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Trades:</span>
              <span className="text-white font-medium">{bestResult.result.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Winning Trades:</span>
              <span className="text-green-400 font-medium">{bestResult.result.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Losing Trades:</span>
              <span className="text-red-400 font-medium">{bestResult.result.losingTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Win:</span>
              <span className="text-green-400 font-medium">${bestResult.result.averageWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Loss:</span>
              <span className="text-red-400 font-medium">${bestResult.result.averageLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Largest Win:</span>
              <span className="text-green-400 font-medium">${bestResult.result.largestWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Largest Loss:</span>
              <span className="text-red-400 font-medium">${bestResult.result.largestLoss.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="card">
          <h4 className="text-md font-medium text-white mb-3">Risk Metrics</h4>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Profit Factor:</span>
              <span className="text-blue-400 font-medium">{bestResult.result.profitFactor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sharpe Ratio:</span>
              <span className="text-green-400 font-medium">{bestResult.result.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Drawdown:</span>
              <span className="text-red-400 font-medium">{bestResult.result.maxDrawdown.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Avg Holding Time:</span>
              <span className="text-white font-medium">{Math.round(bestResult.result.averageHoldingPeriod / (1000 * 60))}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Holding Time:</span>
              <span className="text-white font-medium">{Math.round(bestResult.result.maxHoldingPeriod / (1000 * 60))}m</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recovery Factor:</span>
              <span className="text-blue-400 font-medium">
                {bestResult.result.maxDrawdown > 0 ? (bestResult.result.totalPnL / (bestResult.result.maxDrawdown / 100 * 1000)).toFixed(2) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Returns */}
      {bestResult.result.monthlyReturns.length > 0 && (
        <div className="card">
          <h4 className="text-md font-medium text-white mb-3">Monthly Returns</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {bestResult.result.monthlyReturns.slice(-6).map((month, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-3 text-center">
                <div className="text-sm text-gray-400 mb-1">{month.month}</div>
                <div className={`text-lg font-bold ${month.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {month.return >= 0 ? '+' : ''}{month.return.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  Cum: {month.cumulativeReturn.toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Summary */}
      {results.length > 1 && (
        <div className="card">
          <h4 className="text-md font-medium text-white mb-3">Optimization Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{results.length}</div>
              <div className="text-sm text-gray-400">Parameter Sets Tested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {results.filter(r => r.result.totalReturn > 0).length}
              </div>
              <div className="text-sm text-gray-400">Profitable Strategies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">
                {results[0].score.toFixed(2)}
              </div>
              <div className="text-sm text-gray-400">Best Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {((results.filter(r => r.result.totalReturn > 0).length / results.length) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
