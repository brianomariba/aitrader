'use client'
import { useEffect } from 'react'
import { useDerivStore } from '@/state/derivStore'
import { PortfolioTable } from '../(components)/ui/PortfolioTable'

export default function PortfolioPage() {
  const { fetchPortfolio } = useDerivStore()
  useEffect(() => { fetchPortfolio() }, [fetchPortfolio])

  return (
    <main className="container py-6">
      <div className="card">
        <PortfolioTable />
      </div>
    </main>
  )
}
