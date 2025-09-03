'use client'
import { AdvancedChart } from './AdvancedChart'

type Point = { t: number; v: number }

export function TickChart({ data }: { data: Point[] }) {
  const chartData = data.map((point) => ({
    timestamp: point.t,
    price: point.v
  }))

  return (
    <AdvancedChart
      data={chartData}
      height={300}
      showVolume={false}
      showGrid={true}
    />
  )
}
