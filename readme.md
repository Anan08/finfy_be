
---

# Finfy Backend API (Finfy_BE)

Finfy_BE is a backend service that provides RESTful APIs for **Finfy**, a personal finance tracking application. This service is responsible for authentication, transaction management, and secure data handling for client applications such as mobile or web frontends.

---

## Table of Contents

* Overview
* Key Features
* Technology Stack
* Installation
* Environment Configuration
* API Design Standards
* API Endpoints
* Request & Response Examples
* Project Structure

---

## Overview

Finfy_BE is built using Node.js and Express.js, following RESTful API principles and industry-standard security practices. The backend acts as a centralized service for managing user accounts and financial transactions, ensuring data consistency, authorization, and scalability.

---

## Key Features

* User registration and authentication using JWT
* Secure access to protected resources
* CRUD operations for financial transactions
* RESTful API design with consistent response structures
* MongoDB-based data persistence

---

## Technology Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB
* **ODM:** Mongoose
* **Authentication:** JSON Web Tokens (JWT)

---

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

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

---

## Environment Configuration

The following environment variables are required:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

---

## API Design Standards

This API follows standard REST conventions:

* **Base URL:** `/api`
* **Authentication:** Bearer Token (JWT)
* **Stateless requests**
* **JSON** for request and response bodies
* **HTTP status codes** used to represent request outcomes

### Standard Response Format

Successful response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## API Endpoints

### Authentication

| Endpoint             | Method | Description                     |
| -------------------- | ------ | ------------------------------- |
| `/api/auth/register` | POST   | Register a new user             |
| `/api/auth/login`    | POST   | Authenticate user and issue JWT |

### Transactions

| Endpoint            | Method | Description                |
| ------------------- | ------ | -------------------------- |
| `/api/transactions` | GET    | Retrieve user transactions |
| `/api/transactions` | POST   | Create a new transaction   |

All transaction endpoints require authentication.

---

## Request & Response Examples

### Register User

**Request**

```http
POST /api/auth/register
Content-Type: application/json
```

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "65a1f2c9a9b2e1a123456789",
    "email": "john@example.com"
  }
}
```

---

### Login User

**Request**

```http
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### Get Transactions (Authenticated)

**Request**

```http
GET /api/transactions
Authorization: Bearer <JWT_TOKEN>
```

**Response**

```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "_id": "65a1f5b2a9b2e1a987654321",
      "title": "Groceries",
      "amount": 250000,
      "type": "expense",
      "date": "2025-01-10"
    }
  ]
}
```

---

### Create Transaction (Authenticated)

**Request**

```http
POST /api/transactions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

```json
{
  "title": "Salary",
  "amount": 5000000,
  "type": "income",
  "date": "2025-01-10"
}
```

**Response**

```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "_id": "65a1f7caa9b2e1a456789012",
    "title": "Salary",
    "amount": 5000000,
    "type": "income"
  }
}
```

---

## Project Structure

```
finfy_be/
├── app.js              # Application entry point
├── src/
│   ├── routes/         # API route definitions
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose models
│   ├── middleware/     # Authentication & middleware logic
│   └── utils/          # Utility functions
├── .env.example        # Environment variable template
├── package.json
```

---

## Notes

* All protected routes require a valid JWT.
* This backend is designed to be consumed by web or mobile clients.
* API structure is intended to be extensible for future features.

---
