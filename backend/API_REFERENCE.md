# PharmaCode07 — Mobile & Web REST API Reference

Comprehensive documentation for all REST API endpoints. This reference is designed for both the current web client and future mobile applications (Flutter, React Native, iOS, Android).

---

## 1. Base URL & Protocol
- **Development**: `http://localhost:5000/api`
- **Production**: `https://<your-backend-domain>/api`
- **Response Format**: `application/json`
- **Compression**: Gzip enabled on all endpoints.

---

## 2. Standard Response Envelope

All API endpoints return a standardized JSON envelope:

### Success Response (Single Object)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable confirmation"
}
```

### Success Response (Paginated List)
```json
{
  "success": true,
  "count": 12,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

---

## 3. Authentication & Authorization

All protected endpoints require an **Authorization** header containing the JWT Bearer token:
```http
Authorization: Bearer <accessToken>
```

### Access & Refresh Token Lifecycles
- **Access Token**: Short-lived JWT (7 days) used in `Authorization: Bearer <token>` header.
- **Refresh Token**: Stored securely in client storage (SecureStorage in mobile / localStorage in web). Rotated on every call to `/api/auth/refresh-token`.
- **Soft Lockout**: Accounts are locked for 15 minutes after 5 consecutive failed login attempts to protect against brute force attacks.

---

## 4. Endpoint Reference

### 🔐 A. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new student account (`{ name, email, mobile, password }`) |
| `POST` | `/api/auth/login` | Public | Login with email and password (`{ email, password }`) |
| `POST` | `/api/auth/refresh-token` | Public | Exchange refresh token for new access token & rotate refresh token (`{ refreshToken }`) |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile & active purchased item arrays |
| `PUT` | `/api/auth/update-profile` | Private | Update user name and mobile number (`{ name, mobile }`) |
| `POST` | `/api/auth/forgot-password` | Public | Request password reset email (`{ email }`) |
| `POST` | `/api/auth/reset-password/:token` | Public | Reset password with token from email link (`{ password }`) |

---

### 📚 B. Test Series (`/api/test-series`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/test-series` | Public | List published test series with optional search & pagination (`?category=&examType=&search=&sort=&page=1&limit=12`) |
| `GET` | `/api/test-series/:slug` | Public/OptionalAuth | Get test series details, 3-folder structure (CBT Mocks, PYQs, Subject-Wise) & lock state |
| `GET` | `/api/test-series/paper/:paperId` | Private | Get questions for full CBT test attempt (sanitized without answer keys) |
| `GET` | `/api/test-series/practice/mcqs` | Public | Get random sampler of subject-wise practice MCQs (`?subject=Pharmacology&limit=20`) |

---

### 📝 C. Test Attempts (`/api/attempts`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/attempts/submit` | Private | Submit completed test attempt with dynamic positive/negative evaluation (`{ paperId, answers, timeSpentSeconds }`) |
| `GET` | `/api/attempts/my-attempts` | Private | Get student's past attempt logs enriched with parent series context (`?page=1&limit=10`) |
| `GET` | `/api/attempts/:attemptId` | Private | Get comprehensive test result with score, accuracy %, and question-by-question explanations |

---

### 📖 D. Study Materials & Notes (`/api/materials`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/materials` | Public | List PCI curriculum notes & PYQs (`?courseType=B.Pharm&semesterOrYear=Semester 1&subject=...&page=1&limit=12`) |
| `GET` | `/api/materials/:id` | Public/OptionalAuth | Get study material details and verified PDF URL if unlocked |
| `POST` | `/api/materials/:id/track-download` | Public | Increment material view/download counter |

---

### 📄 E. Single Model Papers (`/api/model-papers`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/model-papers` | Public | List standalone A-la-carte model papers (`?examType=GSSSB&isFree=false&page=1&limit=12`) |
| `GET` | `/api/model-papers/:slug` | Public/OptionalAuth | Get model paper details, CBT link & PDF key |

---

### 🧠 F. Non-Pharma Hub (`/api/non-pharma`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/non-pharma` | Public | List Aptitude, Reasoning, English & GK resources (`?section=reasoning&page=1&limit=12`) |

---

### 💳 G. Payments & Checkout (`/api/payments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments/create-order` | Private | Initiate order, apply coupon, and generate Razorpay order ID (`{ items: [...], couponCode: "..." }`) |
| `POST` | `/api/payments/verify` | Private | Verify Razorpay payment signature via HMAC-SHA256 and unlock packages (`{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`) |
| `POST` | `/api/payments/free-checkout` | Private | Complete free enrollment for 100% discounted or free items (`{ orderId }`) |
| `POST` | `/api/payments/webhook` | Public (Signed) | Asynchronous Razorpay webhook handler for automated payment fulfillment |

---

### 🏷️ H. Coupons (`/api/coupons`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/coupons/validate` | Private | Validate promo code and calculate discount (`{ code: "PHARMA10", orderAmount: 499 }`) |

---

### ✉️ I. Contact & Support (`/api/contact`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/contact` | Public | Submit support inquiry (`{ name, email, mobile, subject, message }`) |

---

### 🛡️ J. Admin Management (`/api/admin`) *(Admin Only)*

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Cached dashboard KPI metrics, 7-day registration/revenue bar charts, and pillar counts |
| `POST` | `/api/admin/test-series` | Create new Test Series package |
| `PUT` | `/api/admin/test-series/:id` | Update existing Test Series package |
| `DELETE` | `/api/admin/test-series/:id` | Delete Test Series package and cascade delete associated folder items & papers |
| `GET` | `/api/admin/folder-items/:seriesId` | Get all folder items inside a test series package |
| `POST` | `/api/admin/folder-items/:seriesId` | Add new item to a folder (cbt_mixed, pyq, or subject_wise) |
| `PUT` | `/api/admin/folder-item/:id` | Update folder item |
| `DELETE` | `/api/admin/folder-item/:id` | Delete folder item |
| `POST` | `/api/admin/papers/:id/bulk-questions` | Import batch MCQ questions into test paper |
| `POST` | `/api/admin/materials` | Create new study material entry |
| `PUT` | `/api/admin/materials/:id` | Update study material entry |
| `DELETE` | `/api/admin/materials/:id` | Delete study material entry |
| `GET` | `/api/admin/coupons` | Get all discount coupons |
| `POST` | `/api/admin/coupons` | Create new discount coupon |
| `DELETE` | `/api/admin/coupons/:id` | Delete coupon |
| `GET` | `/api/admin/orders` | Get complete order and transaction ledger |
| `GET` | `/api/admin/students` | Get directory of registered students |
| `GET` | `/api/admin/contacts` | Get list of contact inquiries |
| `PUT` | `/api/admin/contacts/:id/resolve` | Toggle inquiry status (Pending / Resolved) |
| `DELETE` | `/api/admin/contacts/:id` | Delete inquiry |
| `POST` | `/api/admin/upload` | Upload PDF or image to Cloudinary (multipart/form-data) |

---

## 5. Mobile Integration Guidelines

1. **Authentication State**: Store `accessToken` and `refreshToken` in mobile secure storage (e.g., `flutter_secure_storage` or `react-native-keychain`).
2. **Auto Token Refresh**: Use an HTTP interceptor (e.g. Dio interceptor or Axios interceptor) that automatically calls `POST /api/auth/refresh-token` on receiving a `401 Unauthorized` status.
3. **Pagination Support**: Pass `?page=X&limit=Y` on infinite scrolling lists. Read `meta.hasNext` from response envelope to trigger next page loads.
4. **Offline CBT Mode**: When taking a test attempt, fetch `/api/test-series/paper/:paperId` once, store questions in local device SQLite/Hive, track time locally, and POST to `/api/attempts/submit` upon test finish.
