'use client'
import { useEffect, useRef, useState } from 'react'
import { useDerivStore } from '@/state/derivStore'
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Settings,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react'

interface TickData {
  timestamp: number
  price: number
}

interface ChartProps {
  data: TickData[]
  height?: number
  showVolume?: boolean
  showGrid?: boolean
}

export function AdvancedChart({ data, height = 400, showVolume = true, showGrid = true }: ChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line')
  const [zoom, setZoom] = useState(1)
  const [panOffset, setPanOffset] = useState(0)

  // Calculate price statistics
  const prices = data.map(d => d.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const priceRange = maxPrice - minPrice
  const currentPrice = data[data.length - 1]?.price || 0
  const previousPrice = data[data.length - 2]?.price || currentPrice
  const priceChange = currentPrice - previousPrice
  const priceChangePercent = previousPrice !== 0 ? (priceChange / previousPrice) * 100 : 0

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const container = containerRef.current
    if (!container) return

    // Set canvas size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = height * 2
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${height}px`
    ctx.scale(2, 2)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, height)

    // Draw background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, rect.width, height)

    if (showGrid) {
      // Draw grid lines
      ctx.strokeStyle = '#333333'
      ctx.lineWidth = 0.5

      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (rect.width / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
    }

    // Draw price line
    if (chartType === 'line' && data.length > 1) {
      ctx.strokeStyle = '#ff6b35'
      ctx.lineWidth = 2
      ctx.beginPath()

      data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * rect.width
        const y = height - ((point.price - minPrice) / priceRange) * height

        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })

      ctx.stroke()

      // Add gradient fill under the line
      ctx.lineTo(rect.width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 107, 53, 0.05)')
      ctx.fillStyle = gradient
      ctx.fill()
    }

    // Draw candlestick chart (simplified version)
    if (chartType === 'candlestick' && data.length > 1) {
      const candleWidth = Math.max(2, rect.width / data.length * 0.8)

      data.forEach((point, index) => {
        const x = (index / (data.length - 1)) * rect.width
        const open = index > 0 ? data[index - 1].price : point.price
        const close = point.price
        const high = Math.max(open, close) + (priceRange * 0.02)
        const low = Math.min(open, close) - (priceRange * 0.02)

        const isGreen = close >= open

        // Draw wick
        ctx.strokeStyle = isGreen ? '#00c853' : '#ff1744'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, height - ((low - minPrice) / priceRange) * height)
        ctx.lineTo(x, height - ((high - minPrice) / priceRange) * height)
        ctx.stroke()

        // Draw body
        const bodyHeight = Math.abs(close - open)
        const bodyY = height - ((Math.max(open, close) - minPrice) / priceRange) * height

        ctx.fillStyle = isGreen ? '#00c853' : '#ff1744'
        ctx.fillRect(
          x - candleWidth / 2,
          bodyY,
          candleWidth,
          Math.max(1, (bodyHeight / priceRange) * height)
        )
      })
    }

    // Draw current price line
    if (data.length > 0) {
      const currentY = height - ((currentPrice - minPrice) / priceRange) * height
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1
      ctx.setLineDash([5, 5])
      ctx.beginPath()
      ctx.moveTo(0, currentY)
      ctx.lineTo(rect.width, currentY)
      ctx.stroke()
      ctx.setLineDash([])

      // Current price label
      ctx.fillStyle = '#ffffff'
      ctx.font = '12px monospace'
      ctx.fillText(`$${currentPrice.toFixed(5)}`, rect.width - 80, currentY - 5)
    }

  }, [data, chartType, zoom, panOffset, height, showGrid, currentPrice, minPrice, priceRange])

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 5))
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.1))
  const handleReset = () => {
    setZoom(1)
    setPanOffset(0)
  }

  return (
    <div className="chart-container">
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">Price Chart</span>
            <span className="text-sm text-gray-400">Live Data</span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xl font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${currentPrice.toFixed(5)}
            </span>
            <div className={`flex items-center gap-1 text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{priceChangePercent.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="flex bg-gray-700 rounded-md p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <LineChart className="w-4 h-4 inline mr-1" />
              Line
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'candlestick' ? 'bg-orange-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              Candle
            </button>
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div ref={containerRef} className="relative">
        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ height: `${height}px` }}
        />

        {/* Loading/Empty State */}
        {data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Waiting for market data...</p>
              <p className="text-sm text-gray-500 mt-2">Connect and select a symbol to start</p>
            </div>
          </div>
        )}

        {/* Chart Overlay Info */}
        {data.length > 0 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 rounded px-3 py-1 text-xs text-white">
            {data.length} data points • {chartType === 'line' ? 'Line Chart' : 'Candlestick Chart'}
          </div>
        )}
      </div>

      {/* Chart Footer with Stats */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-xs text-gray-400 border-t border-gray-700">
          <div className="flex gap-4">
            <span>High: ${maxPrice.toFixed(5)}</span>
            <span>Low: ${minPrice.toFixed(5)}</span>
            <span>Range: ${(maxPrice - minPrice).toFixed(5)}</span>
          </div>
          <div className="flex gap-4">
            <span>24h Change: {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%</span>
            <span>Volume: N/A</span>
          </div>
        </div>
      )}
    </div>
  )
}
