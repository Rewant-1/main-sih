# Admin API Endpoints - Quick Reference

## Authentication Endpoints

### Admin Registration (Internal Only)
```
POST /api/v1/auth/register/admin
Headers: 
  - x-internal-api-key: <INTERNAL_API_KEY>
  - Content-Type: application/json
Body: {
  "name": "Institution Name",
  "email": "admin@institution.edu",
  "password": "securePassword",
  "adminType": "college",  // 'school' | 'college' | 'university'
  "address": {
    "street": "123 Main St",
    "city": "Boston",
    "state": "MA",
    "country": "India"  // optional, defaults to India
  },
  "phone": "+1234567890",
  "bio": "Optional description"  // optional
}
```

### Admin Login
```
POST /api/v1/auth/admin/login
Body: {
  "email": "admin@institution.edu",
  "password": "securePassword"
}
Response: {
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": "user-id",
      "name": "Institution Name",
      "email": "admin@institution.edu",
      "userType": "Admin",
      "profileDetails": { /* admin profile */ }
    }
  }
}
```

### Admin Password Reset
```
POST /api/v1/auth/admin/reset-password
Headers: Authorization: Bearer <admin-token>
Body: {
  "oldPassword": "currentPassword",
  "newPassword": "newPassword"
}
```

---

## Admin Management Endpoints

### Get All Admin Names
```
GET /api/v1/admins/names
Headers: Authorization: Bearer <admin-token>
Response: {
  "success": true,
  "data": [
    {
      "name": "Springfield College",
      "email": "admin@springfield.edu",
      "id": "admin-profile-id",
      "userId": "user-id",
      "adminType": "college"
    }
  ]
}
```

### Get Admin By ID
```
GET /api/v1/admins/:id
Headers: Authorization: Bearer <admin-token>
Response: {
  "success": true,
  "data": {
    "_id": "admin-id",
    "userId": {
      "name": "...",
      "email": "...",
      "username": "...",
      "createdAt": "..."
    },
    "adminType": "college",
    "address": {
      "street": "...",
      "city": "...",
      "state": "...",
      "country": "..."
    },
    "phone": "+1234567890",
    "bio": "...",
    "connections": 0,
    "verified": true,
    "createdAt": "..."
  }
}
```

### Update Admin Profile
```
PUT /api/v1/admins/:id
Headers: Authorization: Bearer <admin-token>
Body: {
  "adminType": "university",  // optional
  "address": {                // optional
    "street": "456 New St",
    "city": "Cambridge",
    "state": "MA"
  },
  "phone": "+9876543210",     // optional
  "bio": "Updated bio"        // optional
}
```

### Delete Admin
```
DELETE /api/v1/admins/:id
Headers: Authorization: Bearer <admin-token>
Response: {
  "success": true,
  "message": "Admin deleted successfully"
}
Note: Deletes both Admin profile and User account
```

---

## Alumni Verification (with Admin Tracking)

### Verify Alumni
```
POST /api/v1/auth/verify/:alumniId
Headers: 
  - Authorization: Bearer <admin-token>
  - x-internal-api-key: <INTERNAL_API_KEY>
Body: {}

Note: req.adminId automatically captured for audit logging
```

---

## Middleware Flow

### For Admin-Protected Routes:
1. `authenticateToken` - Verifies JWT, sets `req.user`
2. `checkRole("Admin")` - Ensures `req.user.userType === "Admin"`
3. `captureAdminAction` - Sets `req.adminId` for audit logging

### Example in Code:
```javascript
const { authenticateToken, checkRole, captureAdminAction } = require('./middleware/middleware.auth');

router.post('/some-action', 
  authenticateToken,     // Step 1: Verify token
  checkRole('Admin'),    // Step 2: Check admin role
  captureAdminAction,    // Step 3: Capture admin ID
  controller.action      // Step 4: Execute action
);

// Inside controller:
const action = async (req, res) => {
  const adminId = req.adminId;  // Available for audit logging
  // Perform action...
};
```

---

## Environment Variables Required

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/sih2025

# Authentication
JWT_SECRET=your-jwt-secret-key

# Internal API Security
INTERNAL_API_KEY=your-internal-api-key

# Server
PORT=5001
NODE_ENV=development
```

---

## Frontend Integration

### Update API Base URL
```typescript
// Before (admin backend):
const API_URL = 'http://localhost:5002/api/v1';

// After (root backend):
const API_URL = 'http://localhost:5001/api/v1';
```

### Update Login Endpoint
```typescript
// Admin login
const response = await fetch(`${API_URL}/auth/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### Fetch Admin List
```typescript
const response = await fetch(`${API_URL}/admins/names`, {
  headers: { 
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Migration Checklist

- [ ] Update frontend API base URL to `localhost:5001`
- [ ] Change `/admin-names` to `/admins/names`
- [ ] Test admin registration
- [ ] Test admin login
- [ ] Test admin profile fetching
- [ ] Test alumni verification with admin tracking
- [ ] Remove `USER_BACKEND_URL` from environment
- [ ] Deprecate `sih_2025_admin` folder
- [ ] Update deployment scripts to only deploy root backend

---

## Key Differences from Admin Backend

| Feature | Admin Backend (Old) | Root Backend (New) |
|---------|-------------------|-------------------|
| Port | 5002 | 5001 |
| Admin Names Route | `/admin-names` | `/admins/names` |
| Architecture | Proxy to root backend | Direct database access |
| Dependencies | Requires `USER_BACKEND_URL` | Self-contained |
| Performance | Extra network hop | Direct access |
| Audit Tracking | Manual `x-admin-id` | Automatic via middleware |
| Admin Model | Separate collection | Integrated with User model |

---

## Testing Commands

```bash
# 1. Register admin
curl -X POST http://localhost:5001/api/v1/auth/register/admin \
  -H "x-internal-api-key: test-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Admin","email":"test@admin.com","password":"test123","adminType":"college","address":{"street":"123 St","city":"Boston","state":"MA"},"phone":"5551234567"}'

# 2. Login
curl -X POST http://localhost:5001/api/v1/auth/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@admin.com","password":"test123"}'

# 3. Get admin list (use token from step 2)
curl -X GET http://localhost:5001/api/v1/admins/names \
  -H "Authorization: Bearer <your-token>"

# 4. Get specific admin
curl -X GET http://localhost:5001/api/v1/admins/<admin-id> \
  -H "Authorization: Bearer <your-token>"
```

---

## Success! 🎉

Root backend now has complete admin functionality:
- ✅ Institution-specific admin profiles
- ✅ Admin authentication (login, register, password reset)
- ✅ Admin management (list, view, update, delete)
- ✅ Audit tracking middleware
- ✅ Role-based access control
- ✅ Transaction-safe operations

**No need for separate admin backend anymore!**
