# WordWise

An AI-powered writing assistant designed to help students craft exceptional college essays and statements of purpose. WordWise combines advanced grammar checking, real-time feedback, and intelligent coaching to elevate your writing from ordinary to extraordinary.

## ✨ Features

### 🎯 AI Writing Coach
- **Precision Storytelling**: Get targeted feedback on narrative structure, tone, and impact
- **Real-time Analysis**: Instant suggestions for grammar, style, and clarity
- **Smart Coaching**: Personalized insights based on your writing goals and target programs

### 📝 Advanced Editor
- **Rich Text Editor**: Built with TiptapJS for a seamless writing experience  
- **Live Spell Check**: Powered by Hunspell dictionaries for accurate spell checking
- **Grammar Correction**: AI-powered grammar and style suggestions
- **Sentence Rewriting**: Get alternative phrasings for better clarity and impact

### 🎓 Essay Optimization
- **SOP Analysis**: Comprehensive analysis of statements of purpose
- **Tone Detection**: Identify and adjust your essay's tone
- **Repetition Detection**: Find and fix overused words and phrases
- **Clarity Prompts**: Targeted questions to improve unclear sections
- **Trim Suggestions**: Optimize word count while maintaining impact

### 📊 Progress Tracking
- **Word Count Monitoring**: Track progress against target word limits
- **Writing Statistics**: Monitor improvement over time
- **Goal Tracking**: Set and track writing objectives

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Editor**: TiptapJS with ProseMirror
- **UI Components**: Radix UI, Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT models via Vercel AI SDK
- **State Management**: Zustand
- **Form Handling**: React Hook Form with Zod validation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ipulkitg/grammarly.git
   cd grammarly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # OpenAI
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up the database**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
wordwise/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── coach/         # AI coaching endpoints
│   │   ├── fix/           # Grammar & spelling fixes
│   │   └── rewrite/       # Text rewriting
│   ├── auth/              # Authentication pages
│   ├── documents/         # Document management
│   ├── onboarding/        # User onboarding flow
│   └── profile/           # User profile
├── components/            # React components
│   ├── ui/               # UI components (Radix-based)
│   ├── extensions/       # TiptapJS extensions
│   └── providers/        # Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   └── supabase/        # Supabase client configuration
├── store/                # Zustand stores
├── types/                # TypeScript type definitions
└── supabase/
    └── migrations/       # Database schema migrations
```

## 🎨 Key Components

### Document Editor
- Rich text editing with real-time collaboration
- Custom TiptapJS extensions for spell checking and grammar highlighting
- Sentence-level analysis and rewriting suggestions

### Writing Coach Panel
- Visual feedback using sticky note-style cards
- Comprehensive essay analysis including tone, structure, and clarity
- Interactive checklist for essay completeness

### Onboarding Flow
- Multi-step user profile setup
- Academic background and writing preferences
- Supporting document upload and parsing

## 🔧 API Endpoints

### Writing Analysis
- `POST /api/coach/sop` - Comprehensive SOP analysis
- `POST /api/fix/grammar` - Grammar and style corrections
- `POST /api/fix/spelling` - Spell checking and corrections
- `POST /api/rewrite` - Sentence rewriting suggestions

### Document Management  
- `POST /api/upload` - Document upload and processing
- `POST /api/parse-supporting-docs` - Extract info from uploaded documents

### User Management
- `POST /api/create-test-user` - Development user creation
- `POST /api/setup-test-user` - Test user configuration

## 📊 Database Schema

### Tables
- **users** - User profiles and preferences
- **documents** - Essay documents and metadata
- **suggestions** - AI-generated writing suggestions
- **analytics** - User interaction tracking

### Key Features
- Row Level Security (RLS) for data protection
- Automatic timestamp updates
- JSONB fields for flexible metadata storage

## 🎯 Usage

1. **Sign up** and complete the onboarding process
2. **Create a new document** or upload an existing essay
3. **Write or paste** your content in the editor
4. **Click "Analyze SOP"** to get comprehensive feedback
5. **Review suggestions** in the coaching panel
6. **Apply fixes** directly in the editor
7. **Export or save** your improved essay

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details on:
- Code style and conventions
- Pull request process
- Issue reporting
- Development workflow

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live Demo](https://your-demo-url.com)
- [Documentation](https://docs.your-app.com)
- [Report Issues](https://github.com/ipulkitg/grammarly/issues)

## 💡 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- AI capabilities by [OpenAI](https://openai.com/)
- Rich text editing by [TiptapJS](https://tiptap.dev/)
- UI components by [Radix UI](https://radix-ui.com/)

---

**WordWise** - Transform your writing, unlock your potential. 🚀


