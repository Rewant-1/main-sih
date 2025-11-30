# Authentication API Documentation

This document provides documentation for the authentication APIs for the SIH 2025 User application.

**Base URL**: `/auth`

## 1. Alumni Registration

This endpoint allows a new alumni to register in the system.

*   **Endpoint**: `/register/alumni`
*   **Method**: `POST`
*   **Description**: Creates a new alumni user.

### Request

**Headers**

```json
{
  "Content-Type": "application/json",
}
```

**Body**

The body should contain the user's details.

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "yoursecurepassword",
  "role": "student"
}
```

### Response

**Success (201 Created)**

```json
{
  "message": "User registered successfully",
  "userId": "60d0fe4f5311236168a109ca"
}
```

## 2. User Login

This endpoint allows an existing user to log in.

*   **Endpoint**: `/login`
*   **Method**: `POST`
*   **Description**: Authenticates a user and returns a JWT token.

### Request

**Headers**

```json
{
  "Content-Type": "application/json"
}
```

**Body**

```json
{
  "email": "john.doe@example.com",
  "password": "yoursecurepassword"
}
```

### Response

**Success (200 OK)**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQwZmU0ZjUzMTEyMzYxNjhhMTA5Y2EiLCJpYXQiOjE2MjQzNjEwMzksImV4cCI6MTYyNDM2NDYzOX0...."
}
```
