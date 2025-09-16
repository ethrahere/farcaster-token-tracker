# Farcaster Token Tracker 🚀

A comprehensive dashboard for tracking Farcaster ecosystem token performance with real-time market data, ATH comparisons, and advanced filtering capabilities.

![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.0.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-blue?logo=tailwindcss)

## ✨ Features

- **Real-time Market Data**: Live token prices, market caps, and 24h changes
- **ATH Tracking**: Compare current market caps to all-time highs
- **Auto-refresh**: Data updates every 5 minutes automatically
- **Advanced Search**: Filter tokens by name or symbol
- **Responsive Design**: Optimized for desktop and mobile
- **Dark/Light Theme**: Built-in theme switching
- **50+ Tokens**: Comprehensive Farcaster ecosystem coverage
- **Export Functionality**: CSV export for data analysis

## 🎯 Token Coverage

### Core Farcaster Ecosystem
- **DEGEN** - The flagship Farcaster token
- **HIGHER** - Community-driven Farcaster token
- **MOXIE** - Farcaster social engagement token
- **TOSHI** - Base ecosystem meme coin
- **CLANKER** - AI-generated token platform

### Base Ecosystem & Meme Coins
- BRETT, FWOG, NORMIE, BASED, KEYCAT, and more

### AI & Virtual Protocols
- VIRTUAL, AI16Z, AIXBT, LUNA, GAME, ZEREBRO

### Major DeFi Tokens
- AERO, WELL, PRIME, SEAM, and other Base ecosystem DeFi tokens

### Popular Meme Coins
- PEPE, DOGE, SHIB, WIF, BONK, FLOKI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/farcaster-token-tracker.git
   cd farcaster-token-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your API keys:
   ```env
   NEXT_PUBLIC_PROJECT_NAME="Farcaster Token Tracker"
   NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key
   COINGECKO_API_KEY=your_coingecko_api_key  # Optional for higher rate limits
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 API Keys Setup

### OnchainKit API Key (Required)
1. Visit [Coinbase Developer Platform](https://portal.cdp.coinbase.com/products/onchainkit)
2. Create an account and get your API key
3. Add it to your `.env` file as `NEXT_PUBLIC_ONCHAINKIT_API_KEY`

### CoinGecko API Key (Optional)
1. Visit [CoinGecko API](https://www.coingecko.com/en/api)
2. Sign up for a free or paid plan
3. Add it to your `.env` file as `COINGECKO_API_KEY`
4. Without this key, you'll use the free tier with rate limits

## 🏗️ Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Data Fetching**: TanStack Query for caching and auto-refresh
- **Theme**: next-themes for dark/light mode
- **Blockchain**: OnchainKit for Base ecosystem integration
- **APIs**: CoinGecko for market data

## 📱 Usage

### Search & Filter
- Use the search bar to find tokens by name or symbol
- Search supports partial matches and is case-insensitive
- Example: Search "DEGEN", "higher", or "moxie"

### Sorting
- Click any column header to sort by that field
- Click again to reverse sort order
- Tokens with missing data automatically sort to bottom

### Market Analysis
- **Green badges**: Tokens within 10% of ATH
- **Yellow badges**: Tokens 10-30% below ATH
- **Red badges**: Tokens >30% below ATH
- **Gray badges**: Missing data

### Export Data
- Click the "Export CSV" button to download current data
- Useful for external analysis and record keeping

## 🔧 Development

### Project Structure
```
├── app/                   # Next.js app directory
│   ├── api/              # API routes
│   ├── tokens/           # Token detail pages
│   └── globals.css       # Global styles
├── components/           # React components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── data/                # Static token data
└── types/               # TypeScript definitions
```

### Key Components
- **TokenTable**: Main data table with sorting and responsive design
- **SearchInput**: Real-time search filtering
- **ThemeToggle**: Dark/light mode switcher
- **ExportButton**: CSV export functionality

### Adding New Tokens
1. Edit `data/athData.json`
2. Add token with CoinGecko ID and estimated ATH market cap
3. Restart dev server to see changes

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on git push

### Other Platforms
- **Netlify**: Works with standard build settings
- **Railway**: Supports Next.js out of the box
- **Docker**: Use the included Dockerfile for containerization

## 🛡️ Security

- ✅ Environment variables properly configured
- ✅ API keys excluded from git repository
- ✅ Rate limiting handled gracefully
- ✅ No sensitive data in client-side code
- ✅ CORS and security headers configured

## 📈 Performance

- ⚡ Auto-refresh every 5 minutes
- 💾 Intelligent caching with TanStack Query
- 🎯 Client-side filtering for instant search
- 📱 Responsive design with mobile optimization
- 🔄 Background updates without page reload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for market data API
- [OnchainKit](https://docs.base.org/onchainkit) for Base ecosystem integration
- [Farcaster](https://farcaster.xyz/) community for inspiration
- [Next.js](https://nextjs.org/) team for the amazing framework

## 📞 Support

If you have questions or need help:
- 🐛 [Report issues](https://github.com/yourusername/farcaster-token-tracker/issues)
- 💬 [Start a discussion](https://github.com/yourusername/farcaster-token-tracker/discussions)
- 📧 Contact: [your-email@example.com]

---

**Built with ❤️ for the Farcaster community**