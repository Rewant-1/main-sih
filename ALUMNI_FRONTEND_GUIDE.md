# Alumni Frontend Integration Guide

> **Document for:** Developer building the Alumni Portal Frontend  
> **Backend API Base URL:** `http://localhost:5000/api/v1` (or deployed URL)  
> **Last Updated:** December 6, 2025

---

## 🔐 Authentication

### 1. Alumni Registration
```http
POST /auth/register/alumni
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "email": "rahul.sharma@example.com",
  "password": "SecurePassword123",
  "graduationYear": 2022,
  "degreeUrl": "https://drive.google.com/link-to-degree-certificate"
}
```
**Response:** Returns JWT `token` on success. Store this in `localStorage` or `httpOnly` cookie.

### 2. Alumni Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "rahul.sharma@example.com",
  "password": "SecurePassword123"
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "_id": "...",
      "name": "Rahul Sharma",
      "email": "rahul.sharma@example.com",
      "userType": "Alumni"
    }
  }
}
```

### 3. Get Current User (Auth Check)
```http
GET /auth/me
Authorization: Bearer <token>
```
Use this to verify if the user is still logged in and to get profile data.

---

## 👤 Alumni Profile

### Get All Alumni (Directory)
```http
GET /alumni
Authorization: Bearer <token>
```
Returns list of all alumni with populated `userId` (contains `name`, `email`).

### Get Single Alumni Profile
```http
GET /alumni/:id
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /alumni/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "skills": ["JavaScript", "React", "Node.js"],
  "graduationYear": 2022
}
```

> ⚠️ **Note:** Currently the `Alumni` model is limited. These fields exist:
> - `userId` (ref to User)
> - `verified` (boolean)
> - `graduationYear` (number)
> - `degreeUrl` (string)
> - `skills` (array of strings)
>
> **Missing fields** (to be added): `department`, `degree`, `currentCompany`, `designation`, `linkedIn`, `github`, `twitter`, `portfolio`

---

## 💼 Jobs

### Browse All Jobs
```http
GET /jobs
Authorization: Bearer <token>
```

### Get Single Job
```http
GET /jobs/:id
Authorization: Bearer <token>
```

### Post a Job (Alumni can post)
```http
POST /jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Frontend Developer",
  "company": "TechCorp India",
  "description": "We are looking for a React developer...",
  "location": "Bangalore, India",
  "salary": "12-18 LPA",
  "type": "full-time",
  "skills": ["React", "TypeScript", "Node.js"]
}
```

### Apply to a Job
```http
POST /jobs/:id/apply
Authorization: Bearer <token>
```

### Get My Posted Jobs
```http
GET /jobs/my/posted
Authorization: Bearer <token>
```

---

## 📅 Events

### Get All Events
```http
GET /events
Authorization: Bearer <token>
```

### Get Single Event
```http
GET /events/:id
Authorization: Bearer <token>
```

### Create Event (Alumni can propose, College approves)
```http
POST /events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI/ML Webinar",
  "description": "Learn about latest trends in AI",
  "date": "2025-01-15T10:00:00.000Z",
  "location": "Virtual - Zoom",
  "type": "webinar"
}
```

### Register for Event
```http
POST /events/:id/register
Authorization: Bearer <token>
```

---

## 🤝 Connections

### Get My Connections
```http
GET /connections
Authorization: Bearer <token>
```
Returns both accepted connections and pending requests.

### Send Connection Request
```http
POST /connections/send-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "alumniId": "target_alumni_id_here"
}
```

### Accept Connection Request
```http
POST /connections/accept-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "connectionId": "connection_id_here"
}
```

### Reject Connection Request
```http
POST /connections/reject-request
Authorization: Bearer <token>
Content-Type: application/json

{
  "connectionId": "connection_id_here"
}
```

---

## 💬 Messages / Chat

### Get All Chats
```http
GET /chats
Authorization: Bearer <token>
```

### Get Messages in a Chat
```http
GET /messages?chatId=<chat_id>
Authorization: Bearer <token>
```

### Send Message
```http
POST /messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "chatId": "chat_id_here",
  "message": "Hello! How are you?"
}
```

> ⚠️ **Note:** Real-time messaging (Socket.io) is NOT implemented yet. You'll need to poll or wait for backend updates.

---

## 🎯 Campaigns (Donations)

### Get All Campaigns
```http
GET /campaigns
Authorization: Bearer <token>
```
Optional query params: `?status=active&category=scholarship`

### Get Campaign Details
```http
GET /campaigns/:id
Authorization: Bearer <token>
```

### Donate to Campaign
```http
POST /campaigns/:id/donate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 5000,
  "type": "money",
  "message": "Happy to contribute!",
  "isAnonymous": false
}
```

> ⚠️ **Note:** Payment gateway (Razorpay) is NOT integrated yet. This endpoint currently just records the donation intent.

---

## 🌟 Success Stories

### Get All Stories
```http
GET /success-stories
Authorization: Bearer <token>
```
Optional query params: `?category=entrepreneurship&featured=true`

### Get Single Story
```http
GET /success-stories/:id
Authorization: Bearer <token>
```

### Submit Your Story
```http
POST /success-stories
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "From Campus to CTO",
  "content": "My journey from a student to becoming a CTO...",
  "category": "career_growth",
  "tags": ["leadership", "tech"]
}
```

### Like a Story
```http
POST /success-stories/:id/like
Authorization: Bearer <token>
```

---

## 📋 Surveys

### Get Available Surveys
```http
GET /surveys
Authorization: Bearer <token>
```

### Get Survey Details
```http
GET /surveys/:id
Authorization: Bearer <token>
```

### Submit Survey Response
```http
POST /surveys/:id/respond
Authorization: Bearer <token>
Content-Type: application/json

{
  "answers": [
    { "questionId": "q1_id", "answer": "Very Satisfied" },
    { "questionId": "q2_id", "answer": ["Option A", "Option C"] }
  ]
}
```

---

## 📰 Newsletters

### Get All Newsletters
```http
GET /newsletters
Authorization: Bearer <token>
```

### Get Newsletter Content
```http
GET /newsletters/:id
Authorization: Bearer <token>
```

---

## 📊 Posts / Feed

### Get All Posts (Feed)
```http
GET /posts
Authorization: Bearer <token>
```

### Create a Post
```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Excited to share that I just got promoted!",
  "type": "update"
}
```

### Like a Post
```http
POST /posts/:id/like
Authorization: Bearer <token>
```

### Comment on a Post
```http
POST /posts/:id/comment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Congratulations! Well deserved!"
}
```

---

## 🎴 Alumni Card (Smart Card)

> ⚠️ **Not Implemented Yet:** The QR/NFC-based Alumni Card feature is not in the current backend. This needs to be built.

**Suggested Implementation:**
1. Generate a unique QR code containing alumni ID
2. Store QR data in a new `AlumniCard` model
3. Provide an endpoint `GET /alumni/:id/card` to fetch card data

---

## 🗺️ Geographic Map (Directory)

> ⚠️ **Not Implemented Yet:** No geographic data is stored in the Alumni model.

**Suggested Implementation:**
1. Add `location: { city: String, state: String, country: String, coordinates: { lat: Number, lng: Number } }` to Alumni model
2. Create endpoint `GET /alumni/map-data` that returns alumni with coordinates
3. Use Leaflet.js on frontend to render the map

---

## 🔊 Accessibility Features (REFERENCE.md Requirements)

From the requirements document:
- **Keyboard Navigation:** Ensure all routes are accessible via keyboard (Tab, Enter, Escape)
- **Voice Support:** Consider adding text-to-speech for screen reader users
- **WCAG Compliance:** Use semantic HTML, ARIA labels, proper contrast ratios

---

## 🛠️ Recommended Tech Stack (Frontend)

Based on the Admin Frontend:
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui
- **Animations:** Framer Motion
- **State Management:** Zustand
- **API Client:** Axios with interceptors for auth tokens

---

## 📁 Suggested Page Structure

```
/app
  /login                 # Alumni login
  /register              # Alumni registration
  /dashboard             # Homepage after login
  /profile               # My profile (edit)
  /profile/[id]          # View other alumni profile
  /directory             # Alumni directory with filters + map
  /jobs                  # Browse jobs
  /jobs/post             # Post a job
  /jobs/[id]             # Job details
  /events                # Browse events
  /events/[id]           # Event details
  /events/create         # Propose an event
  /campaigns             # View campaigns
  /campaigns/[id]        # Campaign details + donate
  /success-stories       # Browse stories
  /success-stories/[id]  # Story details
  /success-stories/submit # Submit your story
  /connections           # My connections + requests
  /messages              # Chat interface
  /surveys               # Available surveys
  /surveys/[id]          # Take survey
  /newsletters           # View newsletters
  /feed                  # Social feed (posts)
  /alumni-card           # View/Download smart card
```

---

## 📞 Contact

If you have questions about the backend API or need new endpoints, reach out to the backend team!

