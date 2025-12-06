DASHBOARD ISSUES:
6) Recent Activity
Hardcoded static items:
"New Alumni Registration — John Doe"
"Job Posted — Software Engineer"
"Event Created — Annual Alumni Meet 2025"
"Verification Needed — 3 alumni accounts"
These are not fetched from backend (UI-only placeholders). This is acceptable for mock UI or initial MVP, but consider replacing with an actual feed:
Suggest hooking this to audit-logs (/audit-logs) or analytics/track events for dynamic activity stream.
Conclusion: Intentionally static; consider dynamic feed for production. ⚠️

Security / Consistency notes and potential issues (action items)
Admin UI is not role gated client-side. The layout does not restrict visitors (but back-end protects endpoints).
Because the admin UI fetches data from protected endpoints, it depends on the server returning auth errors when not admin.
Suggest: Add a client-side guard (redirect to /login or show a 403 message if token exists but user is not admin) — improves UX.
newslettersApi.getAll() is protected by admin-only route. Make sure Admin token or account exists (seed script) or frontend will show empty stats.
alumniApi.verify() uses x-internal-api-key via client code (process.env.NEXT_PUBLIC_INTERNAL_API_KEY) — this exposes the internal key in frontend bundles:
Security risk: internal key should not be publicly accessible.
Suggest: Replace internal-key-based verification with a regular authorized route that validates admin JWT instead of a public key in the browser.
The api-client interceptors only auto-redirect for 401 in production; in dev they just log. That may cause silent errors in dev if token expired:
Suggest: Optionally also redirect in dev for easier testing.
Recent Activity is hardcoded and not DB-driven. Suggest: Replace with a dynamic feed (audit logs, event tracker, or analytics events).
Error handling: The store sets error but the dashboard UI doesn't show these errors anywhere — consider adding a top-level error banner for failures.
Backend dependencies to confirm (for real data)
The dashboard expects these backend routes to return expected data:

users /users/:id
/alumni /alumni/profile /alumni/:id
/students /students/profile /students/bulk-create
/jobs /jobs/my/posted
/events
/posts
/campaigns
/surveys
/success-stories (plus /success-stories/featured, /success-stories/:id/share if used)
/newsletters (GET requires admin)
/analytics/* for the Analytics page (not the dashboard itself except if extra cards use it)
All these are present; code is already connected.
Next steps (pick one)
(Safety) Replace x-internal-api-key use in client with an admin-authorized endpoint to avoid exposing internal key. I can implement this backend change and then update frontend usage. 🔧
(UX) Wire dynamic "Recent Activity" to analytics/events or audit-logs. I can update the dashboard to fetch /audit-logs or /analytics/events and show dynamic items. 💡
(Hardening) Add a client-side admin guard (e.g., check userType: 'Admin' in token / user profile) and show 403/Login if not admin. 🔐
(Small improvements) Add clearer error UI for fetch failures and force redirect to /login if token invalid (even in dev) to avoid silent failures. ✅
(Test) If you want, I can run the frontend locally and validate behavior (and test each button), but I need to start the app and you must have the backend running too.

ANALYTICS:
Several charts and sections are still mock data (charts, department/job lists, some numbers). These should be loaded from backend:
Use /analytics/timeseries (for user growth),
Use /analytics/events or /analytics/engagement (for engagement breakdown),
Use /analytics/summary or user/job endpoints to compute department stats.
Recent Activity is mock; it should use backend /audit-logs or analytics events (recent events) to show real changes.
View All on Recent Activity is not implemented — should be wired to a "Audit logs" or activity page.
Export works, but the filename is always JSON and the downloaded file is JSON even for PDF/Excel formats — this is OK for now since backend returns JSON for everything; frontend can be extended to convert it for specific formats or request a proper file stream endpoint.
apiClient silent 401 handling in dev — consider redirect in dev mode or show a friendly UI error.
Some data mapping logic falls back to mock values even when the backend might provide the value — e.g., totalStudents, totalPosts, totalDonations depending on whether the backend aggregates those. If backend already supports these metrics, map them instead of fallback.
Suggested Fixes (Prioritized)
High Priority — Replace mocked chart data with real API data:
Wire user growth to /analytics/timeseries (grouped by month/day).
Wire engagement breakdown to the event counts endpoint /analytics/events or /analytics/engagement.
Wire job category distributions using jobs or analytics getEventCounts grouped by job categories.
High Priority — Make Recent Activity dynamic:
Hook recent activity to audit logs or analytics.getEvents and make the "View All" button navigate to /audit-logs or a dedicated activity page.
Medium Priority — Replace static department statistics:
Use users API (get by department or aggregation) or analytics/summary to compute per-department counts.
Medium Priority — Update fallback values:
Map available backend fields for totalStudents, totalPosts, totalDonations, totalCampaigns if provided in /analytics/dashboard.
If backend doesn't provide them directly, create a service call or summary to include them.
Low Priority — Add error displays and better UX on 401 (in dev as well).
Low Priority — Add a client-side admin guard redirect based on userType (improves UX; backend still enforces security).
Buttons & Actions — Quick Checklist
Refresh: Works (re-fetches dashboard & heatmap)
Export: Works (downloads JSON)
Time range select: Works (updates request params)
Tabs: Works (UI-level)
"View All" on Recent Activity: Not wired → needs to be implemented
Buttons inside Quick actions (not on Analytics page): Other pages are properly wired
Example Implementations (Short plan for the developer)
If you want me to implement the fixes, I recommend we do the changes in the following order (safe, iteratively testable):

Replace the user growth chart data with /analytics/timeseries:
Call: analyticsApi.getTimeSeries({ startDate, endDate, interval: 'month' })
Map returned data to MiniBarChart.
Replace platform engagement chart (engagementData) with /analytics/events grouping:
Call: analyticsApi.getEventCounts({ startDate, endDate, groupBy: 'category' }) or getOverallAnalytics.
Map returned categories to SimpleBarChart.
Wire "Recent Activity" to /audit-logs or analytics.getEvents():
Use auditLogsApi.getAll to fetch log items and list them.
Update "View All" to route to an admin audit logs page (create page if missing).
Replace departmentStats with a live API that aggregates user counts by department (call usersApi or a newly created /analytics/by-department endpoint).

ALUMNI MANAGEMENT:
What’s hardcoded / mock (or missing) ⚠️
Recent Activity list (on the Alumni page): hardcoded placeholder entries (not DB-driven).
No server-sourced paginated listing or audit logs in the alumni table — everything is loaded via getAll and displayed (no pagination).
No error banner for dropdown of fetch failures — the store sets error, but the UI doesn't show a global error.
Buttons & Actions — verification (step-by-step)
1) Verify action (dropdown and modal)
Frontend side:
Triggers usersStore.verifyAlumni(id) which calls alumniApi.verify(id).
After success, verifyAlumni refreshes the alumni list via get().fetchAlumni().
UI shows a toast on success/failure.
Backend side:
alumniApi.verify() calls /auth/verify/:alumniId with x-internal-api-key header.
/auth/verify/:alumniId in routes/auth.js is only permitted via internal key; internalAuth middleware enforces this.
Findings & issues:
Logic works (frontend copies admin action trigger, backend verifies), but the internal API key is supplied from the frontend (NEXT_PUBLIC_INTERNAL_API_KEY), which exposes it in the client bundle — security risk.
Suggestion: Instead, add an admin-only route (protected by user token + role) e.g. POST /alumni/:id/verify or POST /alumni/verify/:id that checks admin JWT. Replace frontend call to use that (and remove x-internal-api-key usage from the client).
2) View Degree (dropdown)
Behavior: window.open(alumniItem.degreeUrl, "_blank") — opens doc in new tab.
Works if alumniItem.degreeUrl exists and is a valid URL and CORS/host is okay.
If the backend does not return degreeUrl at top-level and it sits under profileDetails (model mismatch) this field may be undefined — UI will attempt to open undefined resulting in no action; or it might attempt to open a wrong URL.
3) View Details (dialog)
Works: opens modal with selectedAlumni details:
Name: taken from (selectedAlumni.userId as { name?: string })?.name — i.e., expects a nested userId object.
Graduation Year, Skills, Verification status pulled from alumniItem fields. Risk: This expects an Alumni doc shape where alumni.userId is either a string ID or a User object. If backend returns a User doc (instead of an Alumni doc containing userId), these fields may not be present or may be in profileDetails.
4) Search input/filter in Alumni Table
Works client-side: filters (name/email/graduationYear).
Expectation: the component uses alumniItem.userId for name/email and alumniItem.graduationYear for the year; if alumniItem is actually a User doc with profileDetails, searching would fail or require different property paths.
5) Table controls / dropdowns
‘View Degree’, ‘View Details’, and ‘Verify’ are in DropdownMenu — UI functions are triggered properly if the data shape matches.
No Delete action or edit action is present — good for minimal risk.
Backend ↔ Frontend data shape mismatch (important)
Frontend expects Alumni model shape: Alumni object fields: _id, userId (User object or ID), verified, graduationYear, degreeUrl, skills.
Backend service.alumni.getAlumni() currently returns User documents:
Code: User.find({ userType: 'Alumni' }).populate('profileDetails')
This retrieves User objects with profileDetails containing Alumni info (i.e. the alumni profile is nested under profileDetails).
Mismatch consequences:
UI code uses alumniItem.userId to get the user info; if backend returns user docs (without userId property), alumniItem.userId is undefined.
UI reads alumniItem.verified and alumniItem.graduationYear at the top-level: if backend returns a User doc, these fields are in profileDetails instead.
Fix options:
Update backend getAlumni to return the proper Alumni documents (the Alumni collection instances with userId populated). This will yield alumniItem.userId and alumniItem.verified as expected by the frontend.
OR update frontend to handle the backend's shape (User with profileDetails) and read alumniItem.profileDetails.verified, etc.
Recommendation: Standardize on one shape (frontend expects Alumni model with userId populated) — adjust backend getAlumni in service.alumni.js to query Alumni.find({}) and populate userId. This is cleaner and avoids nested fields.

Security/UX issues and improvements
Internal API Key exposed on frontend: alumniApi.verify uses x-internal-api-key from NEXT_PUBLIC_INTERNAL_API_KEY. Exposing an internal key in public frontend is a severe security issue. Fix: use POST /alumni/:id/verify with admin JWT token instead of using internal key in client.
Auto-redirect on 401 disabled in dev: api-client logs in dev and only redirects in production. This can make dev tokens stale and requests silently fail — consider redirecting in dev for better debugging.
Missing global error display: The store sets error, but pages don't present a visible error area — show a toast or global error banner for failed fetches to avoid silent data absence.
No pagination in alumni table: For large lists, the UI and backend should support pagination, or the table can become huge. Add server-side pagination to /alumni and frontend support.
Recommended Implementation Plan (step-by-step)
Fix data shape mismatch (High priority)

Change backend service.alumni.getAlumni() to return Alumni.find().populate('userId') — return alumni docs with user references populated.
Update other alumni-related backend endpoints similarly.
This ensures alumniItem.userId has user object for frontend to read name, email.
Update tests and docs.
Replace x-internal-api-key in frontend and replace verification endpoint:

Create POST /alumni/:id/verify in backend (protected by admin JWT) that verifies the alumni. Use admin role checks in middleware.
Update frontend alumniApi.verify to call /alumni/:id/verify (admin auth required).
Remove NEXT_PUBLIC_INTERNAL_API_KEY usage from frontend.
Convert Recent Activity to use actual audit-logs (Medium)

Use auditLogsApi.getAll to load activity items.
Replace static items with data from audit-logs.
Wire "View All" to a dedicated audit logs page.
Map additional dynamic metrics to the UI (Medium)

Ensure totalStudents, totalPosts, totalDonations, totalCampaigns are included in analytics.dashboard or derive them on frontend through dedicated API calls and map them in stats.
Global UX & Security updates (Low)

Add a client-side admin guard that uses the user profile (from auth) to check userType.
Add a visible error handler for the alumni table and other fetch failures.
Add server-side pagination for /alumni and update frontend to support it.
Next steps / Do you want me to implement any changes now?
Pick the items you want me to implement and I’ll prioritize:

Option A: Fix Alumni backend shape (step 1 above) and update alumniApi.getAll() mapping.
Option B: Replace verify endpoint to POST /alumni/:id/verify (step 2) — this eliminates public internal API key usage.
Option C: Make Recent Activity dynamic and wire View All (step 3).
Option D: Implement global UX improvements + pagination.

STUDENTS:
Remaining issues & small follow-ups (recommended)
Pagination: Currently getAll returns all students; for large datasets we should:
Add server-side pagination support to /students and update studentsApi.getAll({ page, limit }), then update UI to show pages.
Error presentation: useUsersStore collects error but UI doesn't display global error banners — propose adding an error display (toast or banner) on fetch errors.
Admin Authorization UX:
No client-side admin guard (front-end should verify userType on login/profile, plus the server enforces roles).
Legacy routes & data shape compatibility:
If other code relies on User.find({ userType: 'Student' }) returning data, ensure consistency across codebase and update wherever needed.
Bulk-create response shape:
The bulk-create endpoint still returns created User objects (not Student docs). If the UI ever consumes the bulk-create response, consider returning Student doc shape (with populated userId) for consistency.
Alumni Endpoint Mismatch (out-of-scope but relevant): If alumni uses the same mismatch pattern, apply the same Student fix pattern for alumni: query Alumni model and populate userId (we discussed earlier).
Next steps I can take (pick one or more)
Add server-side pagination to /students and wire the frontend to paginate records. (High value for large sets)
Add error UI for fetchStudents and general useUsersStore errors. (Quick UX improvement)
Update bulk-create to return Student documents (populated userId) for consistency.
Implement the corresponding fix for Alumni (return Alumni docs, not User docs), and verify Admin -> Alumni page (we discussed that earlier).
Add a client-side admin guard to the Admin frontend pages to improve UX (redirect unauthenticated or non-admin).

JOBS:
⚠️ Mismatches / Issues & Recommendations
Role mismatch: Admin UI allows Create/Delete, but backend restricts these to Alumni only

Location: routes.job.js
Current: create/update/delete are protected with checkRole("Alumni")
Problem: Admin users will see the Create/Delete UI but will be blocked by backend 403
Recommendation: Add Admin role to allowed creators/actors:
E.g., checkRole(["Alumni", "Admin"]) for POST/PUT/DELETE
OR change frontend to not show create/delete for non-Alumni if you intend Admins not to modify jobs.
Application status update is unprotected

Location: router.patch("/:id/application-status", AuthMiddleware.authenticateToken, JobController.updateApplicationStatus)
Problem: Any logged-in user (even non-authorized ones) can change application status; this allows students or other users to tamper with application states.
Recommendation: Restrict to job owner (postedBy) or Admin (via checkRole or an in-controller check). Add role/ownership checks in the route/controller: e.g., checkRole(["Alumni", "Admin"]) or verify req.user.userId === postedBy || req.user.userType === 'Admin'.
Admin front-end vs. Alumni operations mismatch

Suggestion: Standardize job management:
Admin should be allowed to manage jobs in the admin portal; make backend routes allow Admin for management operations.
Alternatively, hide management actions if the Admin should not manage job content.
Pagination / UI Scalability

Backend pages all jobs in getJobs; frontend does jobs.length and filters in-memory.
For large job counts, add server-side pagination (page, limit) and update UI to fetch paginated results.
Client-side Authorization UX

Admin UI shows actions, but the client side does not check roles to hide or show actions:
Either control UI based on user.userType or allow Admin to perform those actions server-side.
The api-client also won’t redirect on 401 in dev; consider showing a UI error or redirect.
Data shape & population

Service populates postedBy with name/email and applicants.student with name/email. Good — frontend uses job.postedBy not directly in jobs-ui but it's ready. Missing "Edit" action

UI doesn't show "Edit" — update job may be available in other pages or not implemented; consider adding Edit job option.
✅ What’s Already Good
Jobs UI is fully dynamic; data is fetched from the backend.
Create Job flow, Delete, and View logic are wired correctly to backend endpoints in the store.
Job schema (model.job.js) includes required fields and indexes (text).
Backend service and controller implement job create/get/update/delete functionality, including job application handling.
Suggested Next Fixes (Prioritized)
(High) Fix role mismatches:
Update job routes: allow Admin in create/update/delete routes OR hide UI for Admin.
Add a role or owner check for PATCH /jobs/:id/application-status to prevent unauthorized updates.
(High) Pagination & sorting:
Add page/limit and optional sort filters to /jobs API and wire to frontend.
(Medium) Add Edit job UI:
Provide a dialog to update job and use store updateJob -> API PUT /jobs/:id.
(Medium) Visibility & UX:
Frontend should hide management actions if user is not permitted to prevent errors; add user role detection in frontend.
(Low) Error handling:
Show a visible error banner/toast if fetchJobs fails instead of only logging store error.
