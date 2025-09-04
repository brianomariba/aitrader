# AI Trader - DBot-Style Trading Robot

A comprehensive automated trading platform inspired by DBot, featuring advanced strategy building, backtesting, optimization, and risk management.

##  Features

### Core Trading Features
- **Visual Strategy Builder**: Drag-and-drop interface using Blockly blocks
- **Real-time Trading**: Live execution with Deriv API integration
- **Multiple Contract Types**: Rise/Fall, Higher/Lower, Digits, Accumulators, Multipliers
- **Advanced Charting**: TradingView-style charts with technical indicators

### Advanced Analytics
- **Comprehensive Backtesting**: Historical testing with realistic conditions
- **Strategy Optimization**: Parameter tuning with grid search algorithms
- **Monte Carlo Simulation**: Risk analysis through probabilistic modeling
- **Performance Analytics**: Detailed metrics and risk assessment

### Risk Management
- **Multi-layer Protection**: Daily limits, equity protection, consecutive loss limits
- **Real-time Monitoring**: Live risk assessment and automated stops
- **Emergency Controls**: Panic button for immediate shutdown

##  Project Structure

```
ai-trader/
 frontend/                 # Next.js React application
    app/                  # Next.js app directory
    package.json          # Frontend dependencies
    .env                  # Environment variables
 backend/                  # Backend services
    server/               # Worker scripts
    package.json          # Backend dependencies
 package.json              # Root build orchestration
 README.md                 # This file
```

##  Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/brianomariba/aitrader.git
   cd ai-trader
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

This will start both frontend (Next.js) and backend services concurrently.

### Manual Setup

If you prefer to run services individually:

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in separate terminal)
cd backend
npm install
npm run dev
```

##  Environment Configuration

Create a `.env` file in the `frontend/` directory:

```env
# Deriv API Configuration
NEXT_PUBLIC_DERIV_APP_ID=96690
NEXT_PUBLIC_DERIV_API_URL=wss://ws.derivws.com/websockets/v3
NEXT_PUBLIC_DERIV_OAUTH_URL=https://oauth.deriv.com/oauth2/authorize
NEXT_PUBLIC_REDIRECT_PATH=/oauth
NEXT_PUBLIC_ENFORCE_OAUTH=0

# Application Configuration
APP_ID=96690
PORT=5000
MARKUP_PCT=0

# Development
NODE_ENV=development
```

##  Deployment

### Render.com Deployment

1. **Create a Web Service** (not Background Worker) in Render
2. **Connect your GitHub repository** to Render
3. **Set build command**:
   ```bash
   npm run build
   ```
4. **Set start command**:
   ```bash
   npm start
   ```

### Environment Variables on Render

Add these environment variables in your Render dashboard:

**Required:**
- `PORT=5000` (Render sets this automatically, but you can specify)
- `NODE_ENV=production`

**Optional Trading Configuration:**
- `DERIV_APP_ID=your_app_id_here` (for automated trading)
- `DERIV_TOKEN=your_token_here` (for automated trading)
- `TRADING_SYMBOL=R_100` (default trading symbol)
- `TRADING_AMOUNT=1` (default stake amount)
- `TRADING_DIRECTION=CALL` (default contract type)
- `TRADING_DURATION=3` (default duration)
- `TRADING_UNIT=m` (default duration unit)
- `TRADING_TRADES=5` (number of automated trades)
- `TRADING_COOLDOWN=30` (seconds between trades)

**Frontend Configuration:**
- `NEXT_PUBLIC_DERIV_APP_ID=96690`
- `NEXT_PUBLIC_DERIV_API_URL=wss://ws.derivws.com/websockets/v3`
- `NEXT_PUBLIC_DERIV_OAUTH_URL=https://oauth.deriv.com/oauth2/authorize`
- `NEXT_PUBLIC_REDIRECT_PATH=/oauth`
- `NEXT_PUBLIC_ENFORCE_OAUTH=0`

##  Available Scripts

### Root Level Scripts
- `npm run install-all` - Install dependencies for all services
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all services for production
- `npm run start` - Start production server

### Frontend Scripts (frontend/)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application
- `npm run start` - Start Next.js production server
- `npm run lint` - Run ESLint

### Backend Scripts (backend/)
- `npm run dev` - Start backend in development mode
- `npm run start` - Start backend in production mode

##  Configuration

### Trading Parameters
- **APP_ID**: Your Deriv application ID
- **PORT**: Server port (default: 5000)
- **MARKUP_PCT**: Markup percentage for calculations

### API Configuration
- **DERIV_APP_ID**: Deriv application identifier
- **DERIV_API_URL**: Deriv WebSocket endpoint
- **DERIV_OAUTH_URL**: Deriv OAuth endpoint
- **REDIRECT_PATH**: OAuth redirect path
- **ENFORCE_OAUTH**: Enable/disable OAuth requirement

##  Features Overview

### Strategy Building
- Visual block-based programming interface
- Support for all major Deriv contract types
- Technical indicators and custom conditions
- Strategy templates and examples

### Backtesting & Optimization
- Historical data testing with realistic conditions
- Parameter optimization using grid search
- Monte Carlo simulation for risk analysis
- Performance metrics and analytics

### Risk Management
- Daily loss limits and equity protection
- Consecutive loss monitoring
- Trade frequency controls
- Emergency stop functionality

### Real-time Trading
- Live market data and execution
- Portfolio monitoring and P&L tracking
- Trade history and performance analytics
- Mobile-responsive interface

##  Security

- OAuth 2.0 authentication with Deriv
- Secure WebSocket connections
- Environment variable protection
- No sensitive data in client-side code

##  Performance

- Optimized for real-time data processing
- Efficient chart rendering with Canvas API
- Lazy loading and code splitting
- Progressive Web App features

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License - see the LICENSE file for details.

##  Disclaimer

This software is for educational and research purposes only. Trading involves substantial risk of loss and is not suitable for everyone. Past performance does not guarantee future results. Always test with virtual money first and never risk more than you can afford to lose.

##  Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Built with  using Next.js, TypeScript, and the Deriv API**