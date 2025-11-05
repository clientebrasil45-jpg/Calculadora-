# Reinvestment Calculator for Cell Phone Sales

## Overview
A React-based financial simulation tool for cell phone sales businesses that uses Google's Gemini AI to provide intelligent analysis and insights. The application helps users simulate business growth through reinvestment strategies and provides AI-powered financial consulting.

## Project Architecture

### Frontend (React + TypeScript + Vite)
- **Port**: 5000 (required for Replit webview)
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 6.2
- **Styling**: Tailwind CSS (via CDN - needs production setup)
- **Language**: Portuguese (BR)

### Backend (Express.js)
- **Port**: 3001 (localhost only in development)
- **Purpose**: Secure proxy for Gemini API calls
- **Security**: API key stored server-side, never exposed to client

### Key Features
1. **Financial Simulation**: Calculate reinvestment scenarios for cell phone sales
2. **AI Analysis**: Gemini-powered insights on business trajectory, opportunities, and risks
3. **Interactive Chat**: Follow-up questions with AI consultant
4. **Data Export**: CSV download of simulation results
5. **Real-time Charts**: Visualization of growth patterns

## Recent Changes (GitHub Import Setup)

### Security Implementation
- **Critical Fix**: Moved Gemini API key from client-side to secure backend server
- Created Express proxy server to handle all AI API calls
- Frontend uses relative URLs (`/api/*`) instead of direct API calls
- API key stored in Replit Secrets (GEMINI_API_KEY)

### Replit Environment Configuration
- Updated Vite config to use port 5000 with host 0.0.0.0
- Configured Vite dev proxy to route `/api` requests to backend
- Created production server (`server-prod.js`) that serves both API and static files on port 5000
- Set up development workflow with both servers running simultaneously

### Deployment
- **Target**: VM (stateful deployment)
- **Build**: `npm run build` (Vite production build)
- **Run**: `npm start` (production server on port 5000)

## File Structure
```
├── server.js              # Development backend (port 3001)
├── server-prod.js         # Production backend + static server (port 5000)
├── start.sh              # Development startup script (runs both servers)
├── App.tsx               # Main React application
├── components/           # React components
│   ├── GeminiAnalysis.tsx    # AI analysis display with streaming
│   ├── GrowthChart.tsx       # Financial growth visualization
│   ├── InputGroup.tsx        # Form input components
│   ├── ResultsTable.tsx      # Simulation results table
│   └── SummaryCard.tsx       # Summary statistics cards
├── constants.ts          # Default input values
├── types.ts              # TypeScript type definitions
├── vite.config.ts        # Vite configuration with proxy
└── package.json          # Dependencies and scripts
```

## Environment Variables
- `GEMINI_API_KEY`: **REQUIRED** - Google Gemini API key for AI analysis
  - Both development and production servers validate this key at startup
  - Application will fail fast with clear error message if key is missing
  - Must be set in Replit Secrets before deployment

## Known Issues & Future Improvements

### Production Readiness
1. **Tailwind CSS**: Currently using CDN version (not recommended for production)
   - Should install as PostCSS plugin: `npm install -D tailwindcss postcss autoprefixer`
   - Run `npx tailwindcss init -p`

2. **Babel Transformer**: Using in-browser Babel transformer
   - Already handled by Vite build process in production
   - Warning only appears in development

### Potential Enhancements
1. Add loading states and error handling for network failures
2. Implement session persistence for analysis history
3. Add more chart types for financial visualization
4. Support multiple languages beyond Portuguese
5. Add user authentication for saving simulations

## Development Commands
- `npm run dev`: Start development servers (backend + frontend)
- `npm run backend`: Run backend server only
- `npm run frontend`: Run frontend Vite server only
- `npm run build`: Build production bundle
- `npm start`: Run production server

## User Preferences
- None documented yet (first session)
