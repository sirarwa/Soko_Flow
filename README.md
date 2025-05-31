# 🚀 SokoFlow - AI-Powered Financial Tracker for Small Traders

<div align="center">
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![AI SDK](https://img.shields.io/badge/AI-SDK-orange?style=for-the-badge)](https://sdk.vercel.ai/)

  **Track your income and expenses effortlessly using voice commands and photo receipts**
  
  [🌟 Live Demo](https://v0-mobile-expense-tracker-m6.vercel.app/)]
</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🎯 Target Audience](#-target-audience)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [🏗️ Project Structure](#️-project-structure)
- [🎨 UI Components](#-ui-components)
- [🤖 AI Features](#-ai-features)
- [📱 Mobile Support](#-mobile-support)
- [🌍 Internationalization](#-internationalization)
- [🔒 Security](#-security)
- [📊 Analytics](#-analytics)
- [🧪 Testing](#-testing)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)

---

## ✨ Features

### 🎤 **Voice Input**
- **Natural Language Processing**: Speak transactions naturally in English or Swahili
- **Real-time Transcription**: Live speech-to-text conversion
- **Smart Extraction**: AI automatically extracts amount, description, category, and vendor
- **Multi-language Support**: Works with both English and Swahili voice commands

### 📸 **Photo Receipt Processing**
- **OCR Technology**: Extract data from receipt photos automatically
- **Smart Categorization**: AI suggests appropriate categories
- **Item Detection**: Identifies individual items and prices
- **Receipt Storage**: Secure cloud storage for receipt images

### 📊 **Financial Analytics**
- **Real-time Dashboard**: Live financial overview with beautiful charts
- **Income vs Expense Tracking**: Visual comparison with distinct colors
- **Profit Analysis**: Monthly and yearly profit trends
- **Goal Setting**: Set and track financial goals
- **Custom Reports**: Generate detailed financial reports

### 🎨 **Modern UI/UX**
- **Beautiful Design**: Modern, clean interface with smooth animations
- **Dark/Light Mode**: Automatic theme switching
- **Responsive Design**: Works perfectly on all devices
- **Customizable Dashboard**: Drag-and-drop widget arrangement
- **Accessibility**: Full keyboard navigation and screen reader support

### 🌐 **Multi-language Support**
- **English & Swahili**: Complete translation for both languages
- **Currency Support**: Multiple currency options (KES, USD, EUR, etc.)
- **Localized Formatting**: Date and number formatting based on locale

### 🔐 **Security & Privacy**
- **End-to-end Encryption**: All data encrypted in transit and at rest
- **Secure Authentication**: Supabase Auth with email verification
- **Data Privacy**: No third-party data sharing
- **Offline Support**: Works offline with automatic sync

---

## 🎯 Target Audience

SokoFlow is specifically designed for:

- **Small Business Owners** in Kenya, Tanzania, and Uganda
- **Market Traders** who need quick transaction recording
- **Entrepreneurs** managing multiple income streams
- **Freelancers** tracking project expenses
- **Anyone** who wants simple, AI-powered financial management

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks + Context API
- **Charts**: Recharts
- **Animations**: Framer Motion + CSS Animations

### **Backend**
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### **AI & ML**
- **AI SDK**: Vercel AI SDK
- **LLM**: OpenAI GPT-4o-mini
- **Speech Recognition**: Web Speech API
- **OCR**: Custom AI processing

### **Development Tools**
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Build Tool**: Next.js built-in
- **Deployment**: Vercel

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account
- OpenAI API key

### 1-Minute Setup

\`\`\`bash
# Clone the repository
git clone https://github.com/sirarwa/Soko_Flow/
cd sokoflow

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the app! 🎉

---

## 📦 Installation

### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/sirarwa/Soko_Flow
cd sokoflow
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

### Step 3: Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Step 4: Database Setup

\`\`\`sql
-- Run these SQL commands in your Supabase SQL editor

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')) NOT NULL,
  category VARCHAR(100),
  description TEXT NOT NULL,
  vendor VARCHAR(255),
  customer VARCHAR(255),
  items JSONB,
  receipt_url TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense', 'both')) NOT NULL,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language VARCHAR(5) DEFAULT 'en',
  currency VARCHAR(3) DEFAULT 'KES',
  dashboard_widgets TEXT[] DEFAULT ARRAY['summary', 'income-expense', 'recent', 'profit'],
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Similar policies for other tables...
\`\`\`

### Step 5: Storage Setup

\`\`\`sql
-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);

-- Create storage policy
CREATE POLICY "Users can upload receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts' AND auth.uid()::text = (storage.foldername(name))[1]);
\`\`\`

### Step 6: Start Development

\`\`\`bash
npm run dev
\`\`\`

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ✅ |
| `NEXT_PUBLIC_APP_URL` | Your app's URL | ✅ |

### Supabase Configuration

1. Create a new Supabase project
2. Enable Authentication with email/password
3. Set up the database schema (see Installation step 4)
4. Configure storage for receipt images
5. Add your environment variables

### OpenAI Configuration

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your environment variables
3. The app uses GPT-4o-mini for cost-effective AI processing

---

## 🏗️ Project Structure

\`\`\`
sokoflow/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 auth/                     # Authentication pages
│   ├── 📁 dashboard/                # Dashboard pages
│   │   ├── 📁 add/                  # Add transaction page
│   │   ├── 📁 settings/             # Settings page
│   │   ├── 📁 transactions/         # Transactions list
│   │   └── layout.tsx               # Dashboard layout
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Landing page
│   └── manifest.ts                  # PWA manifest
├── 📁 components/                   # Reusable components
│   ├── 📁 auth/                     # Auth components
│   ├── 📁 ui/                       # shadcn/ui components
│   ├── customizable-dashboard.tsx   # Dashboard widgets
│   ├── income-expense-chart.tsx     # Chart component
│   ├── language-provider.tsx        # i18n provider
│   ├── photo-input.tsx              # Photo processing
│   ├── recent-transactions.tsx      # Transaction list
│   ├── transaction-form.tsx         # Transaction form
│   ├── voice-input.tsx              # Voice processing
│   └── theme-provider.tsx           # Theme provider
├── 📁 lib/                          # Utility libraries
│   ├── ai-service.ts                # AI processing logic
│   ├── supabase.ts                  # Supabase client
│   └── utils.ts                     # Helper functions
├── 📁 hooks/                        # Custom React hooks
├── 📁 public/                       # Static assets
├── 📁 types/                        # TypeScript types
├── .env.example                     # Environment template
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies
\`\`\`

---

## 🎨 UI Components

### Design System

SokoFlow uses a custom design system built on top of shadcn/ui:

- **Colors**: Carefully chosen palette optimized for financial data
- **Typography**: Clear hierarchy with excellent readability
- **Spacing**: Consistent 8px grid system
- **Components**: 40+ reusable UI components
- **Animations**: Smooth micro-interactions

### Key Components

| Component | Purpose | Features |
|-----------|---------|----------|
| `TransactionForm` | Add/edit transactions | Validation, auto-complete |
| `VoiceInput` | Voice recording | Real-time transcription |
| `PhotoInput` | Receipt processing | OCR, image upload |
| `IncomeExpenseChart` | Financial visualization | Interactive charts |
| `CustomizableDashboard` | Widget management | Drag & drop |

---

## 🤖 AI Features

### Voice Processing

\`\`\`typescript
// Example voice input processing
const extractedData = await extractTransactionFromText(
  "Sold 5 shirts for 200 shillings each to John",
  "en"
);

// Result:
{
  type: "income",
  amount: 1000,
  description: "Sold shirts to John",
  items: [{ name: "shirts", quantity: 5, price: 200 }],
  customer: "John",
  confidence: 0.95
}
\`\`\`

### Receipt OCR

\`\`\`typescript
// Example receipt processing
const receiptData = await extractReceiptData(ocrText, "en");

// Result:
{
  vendor: "Central Market",
  total: 1160,
  items: [
    { name: "Rice 10kg", quantity: 1, price: 500 },
    { name: "Beans 5kg", quantity: 1, price: 300 }
  ],
  category: "Inventory",
  confidence: 0.88
}
\`\`\`

### Smart Categorization

The AI automatically suggests categories based on:
- Transaction description
- Vendor name
- Historical patterns
- Common business categories

---

## 📱 Mobile Support

### Progressive Web App (PWA)

SokoFlow is a full PWA with:

- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen
- **Push Notifications**: Transaction reminders
- **Background Sync**: Automatic data synchronization

### Mobile Features

- **Touch Optimized**: Large touch targets
- **Gesture Support**: Swipe actions
- **Camera Integration**: Direct photo capture
- **Voice Recognition**: Mobile speech API
- **Responsive Design**: Adapts to all screen sizes

---

## 🌍 Internationalization

### Supported Languages

- **English (en)**: Primary language
- **Swahili (sw)**: Full translation for East African users

### Adding New Languages

1. Add translations to `components/language-provider.tsx`
2. Update the language selector
3. Test voice recognition support
4. Verify number/date formatting

\`\`\`typescript
// Example translation structure
const languages = {
  en: {
    common: {
      dashboard: "Dashboard",
      transactions: "Transactions",
      // ...
    }
  },
  sw: {
    common: {
      dashboard: "Dashibodi",
      transactions: "Miamala",
      // ...
    }
  }
}
\`\`\`

---

## 🔒 Security

### Data Protection

- **Encryption**: All data encrypted at rest and in transit
- **Row Level Security**: Database-level access control
- **Authentication**: Secure email/password with verification
- **API Security**: Rate limiting and input validation

### Privacy Features

- **Local Processing**: Voice/photo processing happens locally when possible
- **Data Minimization**: Only collect necessary data
- **User Control**: Users can export/delete their data
- **No Tracking**: No third-party analytics or tracking

### Security Best Practices

\`\`\`typescript
// Example RLS policy
CREATE POLICY "Users can only see own data" ON transactions
  FOR ALL USING (auth.uid() = user_id);
\`\`\`

---

## 📊 Analytics

### Built-in Analytics

- **Financial Metrics**: Income, expenses, profit tracking
- **Usage Patterns**: Transaction frequency and timing
- **Goal Progress**: Financial goal achievement tracking
- **Category Analysis**: Spending patterns by category

### Custom Reports

Users can generate:
- Monthly/yearly summaries
- Category breakdowns
- Profit/loss statements
- Tax preparation reports

---

## 🧪 Testing

### Test Structure

\`\`\`bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
\`\`\`

### Testing Strategy

- **Unit Tests**: Component and utility testing
- **Integration Tests**: API and database testing
- **E2E Tests**: Full user journey testing
- **Accessibility Tests**: Screen reader and keyboard testing

---

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**:
   \`\`\`bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   \`\`\`

2. **Environment Variables**: Add all required env vars in Vercel dashboard

3. **Domain Setup**: Configure custom domain if needed

### Alternative Deployments

#### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

#### Manual Deployment

\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

### Environment-Specific Configurations

- **Development**: Hot reload, debug logging
- **Staging**: Production build, test data
- **Production**: Optimized build, real data, monitoring

---

## 🤝 Contributing

I welcome contributions! Here's how to get started:

### Development Setup

1. **Fork the repository**
2. **Create a feature branch**:
   \`\`\`bash
   git checkout -b feature/amazing-feature
   \`\`\`
3. **Make your changes**
4. **Add tests** for new functionality
5. **Run the test suite**:
   \`\`\`bash
   npm test
   \`\`\`
6. **Commit your changes**:
   \`\`\`bash
   git commit -m 'Add amazing feature'
   \`\`\`
7. **Push to your branch**:
   \`\`\`bash
   git push origin feature/amazing-feature
   \`\`\`
8. **Open a Pull Request**

### Contribution Guidelines

- **Code Style**: Follow existing patterns and use Prettier
- **Testing**: Add tests for new features
- **Documentation**: Update README and code comments
- **Commits**: Use conventional commit messages
- **Issues**: Check existing issues before creating new ones

### Areas for Contribution

- 🌍 **Translations**: Add support for more languages
- 🎨 **UI/UX**: Improve design and user experience
- 🤖 **AI Features**: Enhance voice and photo processing
- 📱 **Mobile**: Improve mobile experience
- 🔧 **Performance**: Optimize loading and rendering
- 📊 **Analytics**: Add more financial insights
- 🧪 **Testing**: Increase test coverage
- Please find my prompting process here on Vercel https://v0.dev/chat/mobile-expense-tracker-Se8xtCadQOf

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

\`\`\`
MIT License

Copyright (c) 2024 SokoFlow

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
\`\`\`

---

## 🙏 Acknowledgments

### Technologies

- **[Next.js](https://nextjs.org/)** - The React framework for production
- **[Supabase](https://supabase.com/)** - Open source Firebase alternative
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI integration toolkit
- **[OpenAI](https://openai.com/)** - AI language models

### Inspiration

- **Small traders** in East Africa who inspired this project.
- **Open source community** for amazing tools and libraries.
- **Design inspiration** from modern fintech applications.

### Author
David Arwa

- [GitHub](https://github.com/sirarwa) 
- Feature development
- UI/UX improvements
- Documentation

---

## 📞 Support

- **📖 Documentation**: Check this README and inline code comments
- **📧 Email**: support@sokoflow.co.ke

---

<div align="center">
  <p>Made with ❤️ for small traders everywhere</p>
  <p>
    <a href="https://v0-mobile-expense-tracker-m6.vercel.app/">🌟 Try SokoFlow</a> •
    <a href="https://github.com/sirarwa/Soko_Flow">⭐ Star on GitHub</a> •
    <a href="https://twitter.com/adavio_">🐦 Follow me on Twitter</a>
  </p>
</div>
\`\`\`
