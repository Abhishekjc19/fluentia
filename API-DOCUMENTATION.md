# API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Authentication

#### Sign Up

```http
POST /auth/signup
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### Login

```http
POST /auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe"
  },
  "token": "jwt-token"
}
```

#### Logout

```http
POST /auth/logout
```

**Response:**

```json
{
  "message": "Logout successful"
}
```

---

### User

#### Get Current User

```http
GET /users/me
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "created_at": "2026-02-26T00:00:00Z"
  }
}
```

#### Get User Statistics

```http
GET /users/stats
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "stats": {
    "totalInterviews": 15,
    "completedInterviews": 12,
    "averageScore": 7.8
  }
}
```

---

### Interviews

#### Start Interview

```http
POST /interviews/start
```

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "interview_type": "tech"
}
```

**Response:**

```json
{
  "message": "Interview started successfully",
  "interview": {
    "id": "uuid",
    "user_id": "uuid",
    "interview_type": "tech",
    "status": "in_progress",
    "started_at": "2026-02-26T10:00:00Z"
  },
  "questions": [
    {
      "id": "uuid",
      "interview_id": "uuid",
      "question_text": "What is a closure in JavaScript?",
      "question_order": 1
    }
  ]
}
```

#### Submit Answer

```http
POST /interviews/answer
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
question_id: uuid
answer_text: "A closure is a function that..."
audio: [audio file] (optional)
```

**Response:**

```json
{
  "message": "Answer submitted successfully",
  "answer": {
    "id": "uuid",
    "question_id": "uuid",
    "answer_text": "A closure is a function that...",
    "score": 8,
    "feedback": "Great answer! You correctly explained..."
  }
}
```

#### Complete Interview

```http
POST /interviews/:interviewId/complete
```

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
video: [video file] (optional)
```

**Response:**

```json
{
  "message": "Interview completed successfully",
  "interview": {
    "id": "uuid",
    "status": "completed",
    "score": 7.8,
    "feedback": "Overall, you demonstrated good understanding..."
  },
  "results": {
    "score": 7.8,
    "feedback": "Overall, you demonstrated good understanding...",
    "videoUrl": "https://s3.amazonaws.com/..."
  }
}
```

#### Get Interview Details

```http
GET /interviews/:interviewId
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "interview": {
    "id": "uuid",
    "user_id": "uuid",
    "interview_type": "tech",
    "status": "completed",
    "score": 7.8,
    "feedback": "Overall feedback...",
    "questions": [
      {
        "id": "uuid",
        "question_text": "What is a closure?",
        "answers": [
          {
            "id": "uuid",
            "answer_text": "A closure is...",
            "score": 8,
            "feedback": "Good answer!"
          }
        ]
      }
    ]
  }
}
```

#### Get Interview History

```http
GET /interviews
```

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "interviews": [
    {
      "id": "uuid",
      "interview_type": "tech",
      "status": "completed",
      "score": 7.8,
      "started_at": "2026-02-26T10:00:00Z",
      "completed_at": "2026-02-26T10:30:00Z"
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Validation error message",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Access token required"
}
```

### 403 Forbidden

```json
{
  "error": "Invalid or expired token"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Error details (in development only)"
}
```

---

## Rate Limiting

- Rate limit: 100 requests per 15 minutes per IP
- Header: `X-RateLimit-Remaining`

## WebSocket Events (Future Enhancement)

Real-time interview updates can be implemented using WebSocket:

```javascript
// Connect
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token',
  },
});

// Listen for events
socket.on('question:next', (data) => {
  console.log('Next question:', data);
});

socket.on('answer:evaluated', (data) => {
  console.log('Answer score:', data);
});
```
