# Finfy_BE

Backend API for Finfy, a personal finance tracking application.

## Overview

Finfy_BE is a Node.js backend built with Express.js. It handles:

- User authentication
- Transaction management
- File uploads
- Serving RESTful API endpoints for frontend or mobile clients

## Tech Stack

- Node.js
- Express.js
- MongoDB / Mongoose
- JSON Web Tokens (JWT) for authentication

## Installation

1. Clone the repository:

```bash
git clone https://github.com/Anan08/finfy_be.git
cd finfy_be
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration (MongoDB URI, port, JWT secret, etc.).

4. Start the server:

```bash
npm run dev
```

## API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | User login |
| `/api/transactions` | GET/POST | List or create transactions |

*Add or update routes based on your `src/` folder.*

## Project Structure

```
app.js          # Entry point
src/            # Main application code
.env.example    # Example environment variables
package.json
```
