# ContextEd 📚🤖

> Transform your course materials into an interactive AI-powered learning experience

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-5.1-green)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

ContextEd is an intelligent study companion that allows students to upload course materials (PDFs, images, documents) and engage in meaningful conversations with an AI assistant that understands the context of their course content. Built with a modern TypeScript stack, it leverages RAG (Retrieval Augmented Generation) to provide accurate, context-aware responses to student queries.

## ✨ Key Features

### 🎓 **Course Management**
- Create and organize multiple courses with unique course codes
- Upload course materials (PDF documents, images with OCR support)
- Track document processing and embedding status in real-time
- Delete courses and all associated materials

### 💬 **AI-Powered Chat**
- Context-aware conversations based on uploaded course materials
- Real-time streaming responses with Server-Sent Events (SSE)
- Two chat modes:
  - **Tutorial Mode**: Detailed, educational explanations with follow-up questions
  - **Concise Mode**: Brief, direct answers
- Automatic query refinement for better search results
- Chat history management with automatic summarization
- Persistent message storage across sessions

### 🔐 **Authentication & Security**
- Google OAuth integration via Better Auth
- Secure session management with JWT tokens
- Per-user course isolation and access control
- Rate limiting to prevent abuse
- CORS protection and secure cookie handling

### 🚀 **Advanced Technology**
- **RAG (Retrieval Augmented Generation)**: Uses ChromaDB vector store for semantic search
- **Document Processing**: Automatic text extraction with OCR support for images
- **Background Jobs**: BullMQ-powered queue system for async document processing
- **Real-time Updates**: SSE for embedding progress and chat responses
- **Monitoring**: Sentry integration for error tracking and performance monitoring

## 🏗️ Architecture Overview

ContextEd is built as a **TypeScript monorepo** using Turborepo for efficient build orchestration:

```
ContextEd/
├── apps/
│   ├── web/              # Next.js 16 frontend with React 19
│   └── server/           # Express.js backend API
├── packages/
│   ├── db/               # Prisma schema & database client
│   ├── shared-schemas/   # Zod validation schemas shared between apps
│   └── eslint-config/    # Shared ESLint configuration
```

### Technology Stack

#### Frontend (`apps/web`)
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Styling**: TailwindCSS 4 with shadcn/ui components
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with TanStack Form
- **Authentication**: Better Auth client
- **File Uploads**: UploadThing
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Markdown**: react-markdown with remark-gfm
- **Monitoring**: Sentry for Next.js

#### Backend (`apps/server`)
- **Framework**: Express 5
- **Runtime**: Node.js 20+
- **Language**: TypeScript with tsx for development
- **Database ORM**: Prisma 7 with PostgreSQL
- **Authentication**: Better Auth with Prisma adapter
- **Vector Database**: ChromaDB (local or cloud)
- **Job Queue**: BullMQ with Redis
- **AI/ML**: 
  - Langchain for RAG pipeline
  - Google Generative AI (Gemini) for embeddings and chat
- **Document Processing**: 
  - pdf-lib for PDF manipulation
  - Tesseract.js for OCR
- **File Storage**: UploadThing
- **Rate Limiting**: express-rate-limit
- **Error Handling**: Custom error classes with middleware
- **Testing**: Vitest with coverage
- **Monitoring**: Sentry for Node.js

#### Shared Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: pnpm 10
- **Type Safety**: TypeScript 5.8
- **Validation**: Zod
- **Database**: PostgreSQL with Prisma adapter
- **Caching/Queue**: Redis (via ioredis)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.19.0 or higher
- **pnpm** 10.23.0 (recommended) or npm
- **PostgreSQL** 14+ database instance
- **Redis** 6+ server (for job queue)
- **ChromaDB** (optional - can run locally via Docker)

### External Services Required

1. **Google OAuth** - For authentication
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Google AI API** - For embeddings and chat
   - Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. **UploadThing** - For file uploads
   - Sign up at [UploadThing](https://uploadthing.com/)
   - Create an app and get your token

4. **ChromaDB** (Choose one option):
   - **Option A**: Run locally via Docker: `docker run -p 8000:8000 chromadb/chroma`
   - **Option B**: Use [Chroma Cloud](https://www.trychroma.com/cloud)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Favourfisayo/ContextEd.git
cd ContextEd
```

### 2. Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo and run `postinstall` scripts to generate the Prisma client.

### 3. Configure Environment Variables

#### Backend Configuration (`apps/server/.env`)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/contexted"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-random-secret-key-here"
BETTER_AUTH_KEY="your-encryption-key-here"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Server Configuration
PORT=3000
CORS_ORIGIN="http://localhost:3001"
FRONTEND_URL="http://localhost:3001"

# Google AI Configuration (for embeddings and chat)
GOOGLE_API_KEY="your-google-ai-api-key"

# UploadThing
UPLOADTHING_TOKEN="your-uploadthing-token"

# ChromaDB Configuration
# Option 1: Local ChromaDB
CHROMA_URL="http://localhost:8000"

# Option 2: Chroma Cloud
# CHROMA_CLOUD_TENANT="your-tenant-id"
# CHROMA_CLOUD_DATABASE="your-database-name"
# CHROMA_CLOUD_API_KEY="your-chroma-api-key"
```

#### Frontend Configuration (`apps/web/.env`)

```bash
NEXT_PUBLIC_SERVER_URL="http://localhost:3000"
UPLOADTHING_TOKEN="your-uploadthing-token"
```

### 4. Set Up the Database

Generate Prisma client and push schema to database:

```bash
pnpm run db:push
```

Or run migrations if you prefer:

```bash
pnpm run db:migrate
```

### 5. Start Development Services

#### Option A: Start Everything at Once

```bash
pnpm run dev
```

This starts both the web app and server concurrently.

#### Option B: Start Services Individually

```bash
# Terminal 1: Start the backend server
pnpm run dev:server

# Terminal 2: Start the frontend
pnpm run dev:web

# Terminal 3: Start the embedding worker (for background jobs)
pnpm run worker:dev
```

### 6. Access the Application

- **Frontend**: [http://localhost:3001](http://localhost:3001)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Prisma Studio**: Run `pnpm run db:studio` and visit [http://localhost:5555](http://localhost:5555)

## 📁 Project Structure

### Frontend Structure (`apps/web/src`)

```
apps/web/src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   │   └── sign-in/       # Sign-in page
│   ├── dashboard/         # Protected dashboard routes
│   │   └── courses/       # Course management pages
│   │       ├── page.tsx   # Course list
│   │       ├── new/       # Create new course
│   │       └── [id]/      # Course detail & chat
│   └── page.tsx           # Landing page
├── components/            # Shared UI components
│   ├── ui/               # shadcn/ui base components
│   ├── dashboard-layout.tsx
│   ├── header.tsx
│   └── ...
├── features/             # Feature-based modules
│   ├── auth/            # Authentication logic
│   ├── chat/            # Chat functionality
│   └── courses/         # Course management
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── instrumentation.ts   # Sentry & monitoring setup
```

### Backend Structure (`apps/server/src`)

```
apps/server/src/
├── features/                    # Feature-based architecture
│   ├── auth/
│   │   ├── middleware/         # requireAuth middleware
│   │   └── lib/                # Session utilities
│   ├── courses/
│   │   ├── db/                 # Database queries & mutations
│   │   ├── lib/                # Document processing, embeddings
│   │   ├── queue/              # BullMQ job queue setup
│   │   ├── routes/             # Course API routes
│   │   └── workers/            # Background job workers
│   └── chat/
│       ├── db/                 # Chat database operations
│       ├── lib/                # RAG pipeline, query refinement
│       ├── routes/             # Chat API routes
│       └── helpers/            # Formatting utilities
├── lib/                        # Shared utilities
│   ├── errors/                 # Custom error classes
│   ├── chroma.ts              # ChromaDB client
│   ├── embeddings.ts          # Embedding generation
│   ├── redis.ts               # Redis client
│   └── uploadthing.ts         # File upload config
├── routes/                     # Top-level routes
│   └── protected.routes.ts    # Protected API endpoints
├── auth.ts                     # Better Auth configuration
└── index.ts                    # Express app entry point
```

### Database Package (`packages/db`)

```
packages/db/
├── prisma/
│   └── schema/
│       └── schema.prisma      # Database schema
├── src/
│   └── index.ts              # Prisma client export
└── generated/                 # Generated Prisma client (gitignored)
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **User**: User accounts with OAuth support
- **Session**: Active user sessions
- **Account**: OAuth provider accounts
- **Course**: User-created courses with metadata
- **CourseDoc**: Uploaded course documents with embedding status
- **Message**: Chat messages (user & assistant) linked to courses

Key relationships:
- Users → Courses (one-to-many)
- Courses → CourseDoc (one-to-many)
- Courses → Messages (one-to-many)
- Users → Messages (one-to-many)

## 🔌 API Endpoints

### Public Endpoints

- `GET /` - Health check
- `GET /api/me` - Get current user session
- `POST /api/auth/*` - Better Auth endpoints (login, logout, etc.)

### Protected Endpoints (require authentication)

#### Course Management
- `GET /api/protected/courses` - List all user courses
- `GET /api/protected/courses/:id` - Get single course
- `POST /api/protected/courses/new` - Create new course
- `PATCH /api/protected/courses/:id` - Update course
- `DELETE /api/protected/courses/:id/delete` - Delete course
- `POST /api/protected/courses/documents/new` - Upload course documents
- `GET /api/protected/courses/:id/embedding-status` - Get embedding progress
- `POST /api/protected/courses/documents/:docId/retry` - Retry failed embedding

#### Chat
- `GET /api/protected/chat/:courseId/messages` - Get chat history
- `POST /api/protected/chat/:courseId/messages` - Send message (SSE stream)

#### Embedding Events
- `GET /api/protected/embedding-events/:courseId` - SSE stream for embedding progress

## 🧪 Testing

Run tests with coverage:

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

Tests are located in `apps/server/src` with the `.test.ts` extension.

## 🏗️ Building for Production

Build all apps:

```bash
pnpm run build
```

This compiles:
- Next.js frontend to `.next/`
- Express backend to `dist/`
- All packages using tsdown

## 🚢 Deployment

### Fly.io Deployment (Configured)

The project is configured for deployment on Fly.io:

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Deploy: `fly deploy`

The `fly.toml` configuration includes:
- Main app process (Express server)
- Background worker process (embedding queue)
- Auto-scaling configuration
- Health checks

### Environment Variables for Production

Set production secrets via Fly.io CLI:

```bash
fly secrets set DATABASE_URL="postgresql://..."
fly secrets set GOOGLE_API_KEY="..."
fly secrets set BETTER_AUTH_SECRET="..."
# ... set all other required secrets
```

### Docker Build

The included `Dockerfile` uses a multi-stage build:

```bash
docker build -t contexted .
docker run -p 8080:8080 contexted
```

## 📦 Available Scripts

### Root Level

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all apps and packages
- `pnpm lint` - Lint all code
- `pnpm test` - Run tests with coverage
- `pnpm check-types` - Type-check all TypeScript

### Web App Specific

- `pnpm dev:web` - Start only the web app
- `cd apps/web && pnpm build` - Build web app
- `cd apps/web && pnpm lint` - Lint web app

### Server Specific

- `pnpm dev:server` - Start only the backend server
- `pnpm worker:dev` - Start embedding worker in development
- `cd apps/server && pnpm build` - Build server
- `cd apps/server && pnpm test` - Run server tests

### Database

- `pnpm db:push` - Push schema changes to database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset database (⚠️ deletes all data)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Follow** the existing code style (ESLint + TypeScript)
4. **Test** your changes: `pnpm test`
5. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Open** a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the feature-based folder structure
- Use TanStack Query for data fetching in the frontend
- Use custom error classes in the backend
- Add tests for new features
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

**Database connection errors:**
- Ensure PostgreSQL is running and accessible
- Verify `DATABASE_URL` in `.env` is correct
- Run `pnpm db:push` to sync schema

**Redis connection errors:**
- Start Redis: `redis-server` or via Docker
- Check Redis connection settings in `.env`

**ChromaDB errors:**
- If using local ChromaDB, start it: `docker run -p 8000:8000 chromadb/chroma`
- For Chroma Cloud, verify credentials

**Embedding jobs not processing:**
- Ensure Redis is running
- Start the worker: `pnpm worker:dev`
- Check worker logs for errors

**OAuth errors:**
- Verify Google OAuth credentials
- Check authorized redirect URIs in Google Console
- Ensure `BETTER_AUTH_SECRET` is set

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Langchain](https://www.langchain.com/) and [Google Generative AI](https://ai.google.dev/)

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Favourfisayo/ContextEd/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Favourfisayo/ContextEd/discussions)

---

Made with ❤️ by [Favourfisayo](https://github.com/Favourfisayo)
