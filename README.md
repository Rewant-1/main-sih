# SIH 2025 - Alumni Management System (Root Backend)

Complete backend API for alumni management system with integrated admin functionality.

## 🎉 Admin Backend Integration Complete!

The admin backend from `sih_2025_admin/` has been fully integrated into the root backend. **No need for a separate admin service anymore!**

### What's New
- ✅ **Admin Model** - Full institution profiles with address, phone, adminType
- ✅ **Admin Authentication** - Dedicated login, registration, password reset
- ✅ **Admin Management** - CRUD operations for admin accounts
- ✅ **Audit Tracking** - Automatic admin action logging via middleware
- ✅ **Security Enhanced** - Removed exposed `NEXT_PUBLIC_INTERNAL_API_KEY` from frontend

### Key Endpoints

#### Admin Auth
- `POST /api/v1/auth/register/admin` - Register new admin (internal key required)
- `POST /api/v1/auth/admin/login` - Admin login
- `POST /api/v1/auth/admin/reset-password` - Reset admin password

#### Admin Management
- `GET /api/v1/admins/names` - List all admins (for dropdowns)
- `GET /api/v1/admins/:id` - Get admin by ID
- `PUT /api/v1/admins/:id` - Update admin profile
- `DELETE /api/v1/admins/:id` - Delete admin

#### Alumni/Student Operations
- `POST /api/v1/auth/verify/:alumniId` - Verify alumni (with admin tracking)
- All existing alumni and student endpoints

### Quick Start

```bash
# Install dependencies
npm install

# Start backend (production)
npm start

# Start with in-memory MongoDB (testing)
npm run dev:memdb

# Run smoke tests
npm run test:smoke-admin
```

### Environment Variables

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sih2025
JWT_SECRET=your-secret-key
INTERNAL_API_KEY=your-internal-key
NODE_ENV=development
```

## 📚 Documentation

- [Admin API Reference](./ADMIN_API_REFERENCE.md) - Complete API documentation
- [Integration Guide](./ADMIN_INTEGRATION_COMPLETE.md) - What was integrated
- [Visual Comparison](./ADMIN_INTEGRATION_VISUAL.md) - Before/after architecture
- [API Integration](./API_INTEGRATION.md) - General API docs

## 🏗️ Architecture

### Unified Backend (Port 5001)
- Alumni management
- Student management  
- **Admin management** (NEW)
- Jobs, Events, Posts
- Campaigns, Surveys
- Analytics, KYC, Invitations

### Frontend Admin (Port 3000)
- Already configured to use `localhost:5001`
- Security fix: No more exposed internal keys
- Uses admin JWT tokens for authentication

## 🚀 Deployment

### Single Backend Deployment
```bash
# Production
pm2 start app.js --name "sih-backend"

# Monitor
pm2 logs sih-backend
pm2 status
```

### Migration from Old Setup
If you were running separate admin backend:
1. ✅ Stop admin backend service (port 5002)
2. ✅ Update frontend to point to port 5001 (already done)
3. ✅ Remove `USER_BACKEND_URL` from environment variables
4. ✅ Delete `sih_2025_admin` folder (optional, can keep for reference)

## 📁 Project Structure

```
src/
├── controller/
│   ├── controller.admin.js      ✨ NEW
│   ├── controller.auth.js       ✅ Enhanced
│   ├── controller.alumni.js
│   └── ...
├── model/
│   ├── model.admin.js          ✨ NEW
│   ├── model.user.js
│   └── ...
├── routes/
│   ├── routes.admin.js         ✨ NEW
│   ├── routes.auth.js          ✅ Enhanced
│   └── ...
├── middleware/
│   └── middleware.auth.js      ✅ Enhanced (captureAdminAction, allowInternalOrAdmin)
scripts/
├── smoke-test-admin.js         ✨ NEW
└── run-with-memory-db.js       ✨ NEW
```

## 🔒 Security

- JWT-based authentication (7-day expiry for admins)
- bcrypt password hashing (10 rounds)
- Internal API key for admin registration
- Role-based access control (Admin/Alumni/Student)
- Automatic admin audit logging

## 🧪 Testing

```bash
# Smoke test all admin endpoints
npm run test:smoke-admin

# Start with in-memory DB (isolated testing)
npm run dev:memdb
```

## 📊 Features

### User Management
- ✅ Alumni registration & verification
- ✅ Student registration & management
- ✅ **Admin registration & management** (NEW)

### Content Management
- ✅ Posts, Jobs, Events
- ✅ Success Stories
- ✅ Newsletters

### Campaigns & Fundraising
- ✅ Campaign creation & management
- ✅ Donation tracking
- ✅ Campaign analytics

### Analytics & Reporting
- ✅ Dashboard analytics
- ✅ Event tracking
- ✅ **Admin action audit logs** (NEW)

### Data Management
- ✅ Bulk imports (CSV)
- ✅ KYC verification
- ✅ Invitation system

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests: `npm run test:smoke-admin`
4. Submit PR

## 📞 Support

For issues or questions, refer to:
- [Admin API Reference](./ADMIN_API_REFERENCE.md)
- [Integration Guide](./ADMIN_INTEGRATION_COMPLETE.md)
