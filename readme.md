# Finfy Backend API

**Finfy** is an AI-powered personal finance management platform. This repository contains the backend REST API responsible for authentication, transaction tracking, financial analytics, AI-driven insights, goal management, and data export.

---

## Table of Contents

- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Profile](#profile)
  - [Transactions](#transactions)
  - [Categories](#categories)
  - [Analytics](#analytics)
  - [AI Chat](#ai-chat)
  - [Goals](#goals)
  - [Export / Import](#export--import)

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Register, login, email verification, password reset via JWT |
| **Transactions** | Full CRUD with pagination, category & type classification |
| **Financial Analytics** | Spending distribution, spending timeline, monthly spending, financial profile |
| **AI Insights** | Groq-powered (Llama 3.1) financial analysis with daily rate-limiting |
| **AI Chatbot** | Context-aware financial advisor chatbot with conversation history |
| **Auto-Categorization** | AI-based transaction categorization |
| **Goal Tracking** | Savings goals with progress tracking and goal transactions |
| **User Profile** | Editable profile with occupation, age, financial goals |
| **Data Export** | Styled Excel (.xlsx) export with timeframe filtering |
| **CSV Import** | Bulk transaction upload via CSV file |
| **Email Service** | Email verification & password reset via nodemailer |

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express.js 5 |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT + bcrypt |
| AI Engine | Groq SDK (Llama 3.1 8B) |
| Email | Nodemailer (SMTP) |
| File Upload | Multer |
| CSV Parsing | fast-csv |
| Excel Export | ExcelJS |
| Scheduling | node-cron |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB instance)
- Groq API key ([console.groq.com](https://console.groq.com))
- Gmail App Password (for email features)

### Installation

```bash
# Clone the repository
git clone https://github.com/Anan08/finfy_be.git
cd finfy_be

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev

# Start production server
npm start
```

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server
PORT=3000
NODE_ENV=development
BACKEND_URL=http://localhost:3000

# Database
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/finfy
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_jwt_secret

# AI
GROQ_API_KEY=your_groq_api_key

# Email (Gmail SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
MAIL_FROM=your_email@gmail.com
```

---

## Project Structure

```
finfy_be/
├── app.js                          # Entry point, Express setup, MongoDB connection
├── package.json
├── .env.example
│
├── src/
│   ├── routes/
│   │   ├── index.js                # Route aggregator (/api)
│   │   ├── auth.js                 # Authentication routes
│   │   ├── profile.js              # User profile routes
│   │   ├── transaction.js          # Transaction CRUD routes
│   │   ├── categories.js           # Category & AI categorization routes
│   │   ├── analytics.js            # Financial analytics routes
│   │   ├── chat.js                 # AI chatbot routes
│   │   ├── goals.js                # Goal tracking routes
│   │   └── csv.js                  # Import/export routes
│   │
│   ├── controllers/
│   │   ├── authController.js       # Auth logic (login, register, password reset)
│   │   ├── profileController.js    # Profile retrieval & updates
│   │   ├── transactionController.js# Transaction CRUD operations
│   │   ├── categoryController.js   # Category listing
│   │   ├── aiController.js         # AI auto-categorization
│   │   ├── analyticsController.js  # Financial analytics & AI insights
│   │   ├── chatSessionController.js# Chat session management
│   │   ├── goalController.js       # Goal CRUD & transactions
│   │   └── csvController.js        # Excel export & CSV import
│   │
│   ├── models/
│   │   ├── User.js                 # User account
│   │   ├── Profile.js              # User profile (job, age, goals)
│   │   ├── Transaction.js          # Financial transaction
│   │   ├── TransactionType.js      # Income / Outcome
│   │   ├── Category.js             # Transaction category
│   │   ├── Goal.js                 # Savings goal
│   │   ├── GoalTransaction.js      # Goal contribution record
│   │   ├── ChatMessage.js          # Chat conversation message
│   │   ├── ChatSession.js          # Chat session
│   │   ├── Insight.js              # Cached AI insights
│   │   ├── Budget.js               # Budget definition
│   │   ├── BudgetLog.js            # Budget tracking log
│   │   ├── FinancialHistory.js     # Historical financial data
│   │   └── Advisor.js              # Financial advisor config
│   │
│   ├── lib/
│   │   ├── auth.js                 # JWT authentication middleware
│   │   ├── mailer.js               # Email sending utilities
│   │   ├── multer.js               # File upload configuration
│   │   ├── profile.js              # Profile helper utilities
│   │   ├── groq.js                 # Groq AI client setup
│   │   ├── aiTools.js              # AI tool definitions
│   │   ├── analyzer.js             # Financial data analyzer
│   │   ├── financialProfileCore.js # Core financial calculations
│   │   ├── getFinancialProfile.js  # Financial profile aggregator
│   │   └── budgetLog.js            # Budget logging utilities
│   │
│   ├── services/
│   │   └── aiServices.js           # AI response service layer
│   │
│   └── seeders/                    # Database seed scripts
│
└── uploads/                        # Temporary file upload directory
```

---

## API Reference

> **Base URL:** `/api`
>
> **Authentication:** All protected endpoints require a Bearer token in the `Authorization` header:
> ```
> Authorization: Bearer <JWT_TOKEN>
> ```

---

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ✗ | Register a new user |
| `POST` | `/api/auth/login` | ✗ | Login and receive JWT token |
| `GET` | `/api/auth/me` | ✓ | Get current authenticated user |
| `PUT` | `/api/auth/change-password` | ✓ | Change user password |
| `GET` | `/api/auth/verify-email` | ✗ | Verify email via token |
| `POST` | `/api/auth/forgot-password` | ✗ | Request password reset email |
| `POST` | `/api/auth/reset-password` | ✗ | Submit new password with reset token |

---

### Profile

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/profile` | ✓ | Get user profile |
| `PUT` | `/api/profile/update` | ✓ | Update profile (name, job, age, goals) |

---

### Transactions

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/transaction/add` | ✓ | Create a new transaction |
| `GET` | `/api/transaction/getAll` | ✓ | Get all transactions |
| `GET` | `/api/transaction/getTransactions` | ✓ | Get paginated transactions |
| `PUT` | `/api/transaction/update/:id` | ✓ | Update a transaction |
| `DELETE` | `/api/transaction/delete/:id` | ✓ | Delete a transaction |

**Query Parameters** for `getTransactions`:

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |

---

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/categories` | ✗ | Get all categories |
| `POST` | `/api/categories/categorize` | ✗ | AI auto-categorize a transaction description |

---

### Analytics

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/analytics/financial-profile` | ✓ | Get complete financial profile & ratios |
| `GET` | `/api/analytics/spending-distribution` | ✓ | Get spending breakdown by category |
| `GET` | `/api/analytics/this-month-spending` | ✓ | Get current month total spending |
| `GET` | `/api/analytics/spending/timeline` | ✓ | Get daily spending timeline |
| `GET` | `/api/analytics/ai-insight` | ✓ | Generate AI-powered financial insights |
| `GET` | `/api/analytics/saved-insights` | ✓ | Get cached insights |

**Query Parameters** for `spending/timeline`:

| Param | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `range` | string | `30d` | `7d`, `30d`, `60d`, `1y`, `all` | Timeframe filter |

> **Note:** AI insights are rate-limited to **2 generations per day** per user.

---

### AI Chat

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/chat/send` | ✓ | Send a message and receive AI response |
| `GET` | `/api/chat/history` | ✓ | Get full conversation history |
| `POST` | `/api/chat/reset` | ✓ | Clear conversation history |

The AI chatbot is context-aware — it has access to the user's financial profile, transaction history, and previous messages to provide personalized financial advice.

---

### Goals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/goals` | ✓ | Create a savings goal |
| `GET` | `/api/goals` | ✓ | Get all goals |
| `PUT` | `/api/goals/:goalId` | ✓ | Update a goal |
| `DELETE` | `/api/goals/:goalId` | ✓ | Delete a goal |

---

### Export / Import

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/csv/download` | ✓ | Export transactions as styled Excel (.xlsx) |
| `POST` | `/api/csv/upload` | ✓ | Import transactions from CSV file |

**Query Parameters** for `download`:

| Param | Type | Default | Options | Description |
|-------|------|---------|---------|-------------|
| `range` | string | `all` | `7d`, `30d`, `60d`, `1y`, `all` | Timeframe filter |

**Excel Export Features:**
- Transactions grouped by type (Income / Outcome)
- Colored section headers (green for Income, red for Outcome)
- Bold column headers with dark background
- Alternating row shading
- Currency number formatting
- Subtotals per section
- Auto-sized columns

**CSV Import Format:**

```csv
description,amount,category,date
Salary,5000000,Work,2026-01-15
Lunch,50000,Food,2026-01-15
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with nodemon |
| `npm start` | Start production server |

---

## License

ISC
