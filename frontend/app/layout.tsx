import './styles/globals.css'
import type { ReactNode } from 'react'
import { DBotHeader } from './(components)/layout/DBotHeader'
import { DBotSidebar } from './(components)/layout/DBotSidebar'
import { DBotPanel } from './(components)/layout/DBotPanel'

export const metadata = { title: 'AI Trader - Professional Automated Trading Platform', description: 'Build, test, and deploy automated trading strategies with advanced risk management powered by Deriv API' }

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="workspace-grid">
          <DBotHeader />
          <DBotSidebar />
          <main className="workspace-main">
            {children}
          </main>
          <DBotPanel />
        </div>
      </body>
    </html>
  )
}
