# AI Product Creator

AI-powered platform for creating and analyzing digital products with market trend analysis and automated product generation.

## 🚀 Live Demo

Visit the live application: [https://dgpro.vercel.app/](https://dgpro.vercel.app/)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/shouravrahman/dgpro.git
   cd ai-product-creator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key
   FIRECRAWL_API_KEY=your_firecrawl_api_key
   RAPIDAPI_KEY=your_rapidapi_key
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## 🚀 Deployment

The application is automatically deployed to Vercel on every push to the `master` branch.

### Manual Deployment

```bash
npm run build
npm start
```

## 🔄 CI/CD Setup

### GitHub Secrets Required

Add these secrets in your GitHub repository settings:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `VERCEL_TOKEN` - Your Vercel API token
4. `ORG_ID` - Your Vercel organization ID
5. `PROJECT_ID` - Your Vercel project ID

### Getting Vercel Configuration

1. **Get Vercel Token**:
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Copy the token value

2. **Get Organization ID**:
   - Go to your [Vercel Team Settings](https://vercel.com/teams)
   - Copy the Team ID from the URL or settings

3. **Get Project ID**:
   - Go to your project in Vercel Dashboard
   - Go to Settings → General
   - Copy the Project ID

## 📁 Project Structure

```
ai-product-creator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Dashboard routes
│   │   ├── (admin)/           # Admin routes
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   └── providers/        # Context providers
│   ├── lib/                  # Utility functions
│   │   ├── supabase/         # Supabase configuration
│   │   └── utils.ts          # Helper functions
│   └── test/                 # Test utilities
├── .github/
│   └── workflows/            # GitHub Actions
├── public/                   # Static assets
└── ...config files
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run type-check` - Run TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you have any questions or need help, please open an issue in the GitHub repository.
