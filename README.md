# SEO Audit Pro

**Comprehensive SEO audit platform with DataForSEO API integration, automated reporting, and AI-powered insights**

![SEO Audit Pro Dashboard](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🚀 Overview

SEO Audit Pro is a full-stack web application that automates comprehensive SEO audits using the DataForSEO API. Built for SEO professionals, digital marketing agencies, and website owners who need data-driven insights to improve their search engine rankings.

### Key Features

- **🔍 Automated SEO Audits**: Complete website analysis in minutes
- **📊 On-Page Analysis**: Full site crawling, HTTP status monitoring, meta tag audits, duplicate content detection
- **🔗 Backlink Profiling**: Comprehensive backlink analysis with toxic link detection and domain authority metrics
- **🤖 AI-Powered Insights**: Automated report generation with critical issues, warnings, and positive signals
- **👤 User Authentication**: Secure login with Manus OAuth
- **⚙️ Integration Management**: Easy DataForSEO API credential configuration
- **📈 Dashboard**: Real-time statistics and audit history

## 🎥 Demo Video

Watch the promotional video: [SEO Audit Pro Demo](https://ai.invideo.io/ai-mcp-video?video=seo-audit-pro-platform-zftrbc)

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for styling
- **tRPC 11** for type-safe API calls
- **shadcn/ui** component library
- **Wouter** for routing

### Backend
- **Express 4** server
- **tRPC 11** for API layer
- **Drizzle ORM** with MySQL/TiDB
- **DataForSEO API** integration
- **OpenAI API** for AI-powered summaries

### Infrastructure
- **Manus OAuth** for authentication
- **MySQL/TiDB** database
- Full TypeScript support across the stack

## 📋 Prerequisites

Before running SEO Audit Pro, you need:

1. **DataForSEO API Credentials**
   - Sign up at [app.dataforseo.com](https://app.dataforseo.com/)
   - Get your API login (email) and password
   - Ensure your account has sufficient balance

2. **Database**
   - MySQL 8.0+ or TiDB compatible database

3. **Node.js**
   - Node.js 22.x or higher
   - pnpm package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/steadycalls/seo-audit-pro.git
cd seo-audit-pro
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=mysql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=your-manus-app-id
VITE_APP_TITLE=SEO Audit Pro
VITE_APP_LOGO=https://your-logo-url.com/logo.png
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
```

### 4. Set Up Database

```bash
pnpm db:push
```

### 5. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## 📖 Usage Guide

### Step 1: Configure DataForSEO Integration

1. Navigate to **Integrations** page
2. Click **Add Credentials**
3. Enter your DataForSEO API login (email) and password
4. Click **Add Integration**

### Step 2: Run Your First Audit

1. Go to **Dashboard** or **Audits** page
2. Click **New Audit**
3. Enter the domain you want to audit (e.g., `example.com`)
4. Click **Start SEO Audit**

### Step 3: View Results

The audit typically takes 2-5 minutes. You'll see:

- **Critical Issues**: Problems requiring immediate attention
- **Warnings**: Opportunities for improvement
- **Good Signals**: Positive aspects of your SEO
- **Technical Details**: Comprehensive metrics including:
  - On-page metrics (404 errors, missing meta tags, duplicate content)
  - Backlink metrics (total backlinks, referring domains, toxic links)
  - Performance metrics (load time, mobile score)

## 💰 Credit Usage Estimation

For a typical 100-page website with 100 backlinks:

- **Estimated Manus Credits**: ~485 credits
- **Estimated DataForSEO Cost**: $0.50 - $1.00
- **Processing Time**: 2-5 minutes

## 🏗️ Project Structure

```
seo-audit-pro/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # tRPC client setup
│   │   └── App.tsx        # Main app with routing
├── server/                # Backend Express application
│   ├── routers.ts         # tRPC API routes
│   ├── db.ts              # Database query helpers
│   └── services/          # Business logic
│       ├── dataforseo.ts  # DataForSEO API integration
│       └── auditEngine.ts # Audit orchestration
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Database tables
└── shared/                # Shared types and constants
```

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management

### Adding New Features

1. Update database schema in `drizzle/schema.ts`
2. Run `pnpm db:push` to apply changes
3. Add query helpers in `server/db.ts`
4. Create tRPC procedures in `server/routers.ts`
5. Build UI components in `client/src/pages/`

## 📊 Audit Workflow

The audit engine executes in three phases:

### Phase 1: On-Page & Technical Analysis
- Full site crawl (up to 100 pages)
- HTTP status code analysis
- Meta tag audit (titles, descriptions, H1s)
- Duplicate content detection
- Image optimization check
- Page speed and Core Web Vitals
- Mobile-friendliness assessment

### Phase 2: Off-Page & Authority Analysis
- Backlink profile summary
- Referring domains analysis
- Dofollow vs. Nofollow ratio
- Toxic link detection
- Domain authority metrics

### Phase 3: AI-Powered Summary
- Critical issues identification
- Improvement opportunities
- Positive signal recognition
- Actionable recommendations

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **DataForSEO** for providing comprehensive SEO data APIs
- **Manus** for the development platform and infrastructure
- **shadcn/ui** for the beautiful component library

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for the SEO community**

