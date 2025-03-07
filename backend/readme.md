# Task Management API

## Overview

This is a RESTful API for managing tasks and user authentication. It provides endpoints for creating, retrieving, updating, and deleting tasks, as well as user authentication (register, login, and profile retrieval).

## Base URL

```
http://localhost:5000/api
```

---

## Authentication Routes

### **1. Register a User**

**Endpoint:** `POST /api/auth/register`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

---

### **2. Login a User**

**Endpoint:** `POST /api/auth/login`

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com"
  },
  "token": "jwt_token"
}
```

---

### **3. Get User Profile**

**Endpoint:** `GET /api/auth/me`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response:**

```json
{
  "id": "user_id",
  "email": "user@example.com"
}
```

---

## Task Routes

### **1. Create a Task**

**Endpoint:** `POST /api/task/`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Request:**

```json
{
  "title": "New Task",
  "description": "Task description",
  "status": "pending"
}
```

**Response:**

```json
{
  "_id": "task_id",
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "user": "user_id"
}
```

---

### **2. Get All Tasks**

**Endpoint:** `GET /api/task/`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response:**

```json
[
  {
    "_id": "task_id",
    "title": "New Task",
    "description": "Task description",
    "status": "pending",
    "user": "user_id"
  }
]
```

---

### **3. Get a Task by ID**

**Endpoint:** `GET /api/task/:id`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response:**

```json
{
  "_id": "task_id",
  "title": "New Task",
  "description": "Task description",
  "status": "pending",
  "user": "user_id"
}
```

---

### **4. Update a Task**

**Endpoint:** `PUT /api/task/:id`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Request:**

```json
{
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed"
}
```

**Response:**

```json
{
  "_id": "task_id",
  "title": "Updated Task",
  "description": "Updated description",
  "status": "completed",
  "user": "user_id"
}
```

---

### **5. Delete a Task**

**Endpoint:** `DELETE /api/task/:id`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response:**

```json
{
  "message": "Task deleted successfully"
}
```

---

### **6. Get Task Statistics**

**Endpoint:** `GET /api/task/statistics`

**Headers:**

```json
{
  "Authorization": "Bearer jwt_token"
}
```

**Response:**

```json
{
  "totalTasks": 10,
  "completedTasks": 5,
  "pendingTasks": 5
}
```

---

## **Authentication Middleware**

All protected routes require an Authorization header:

```json
{
  "Authorization": "Bearer jwt_token"
}
```

## **Setup Instructions**

1. Clone the repository:
   ```sh
   git clone <repository_url>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and set up environment variables:
   ```sh
   PORT=5000
   JWT_SECRET=your_secret_key
   ```
4. Start the server:
   ```sh
   npm start
   ```
5. Use an API testing tool like **Postman** or **cURL** to test the endpoints.

---

## **Technologies Used**

- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT) for authentication

---

## **License**

This project is licensed under the MIT License.
