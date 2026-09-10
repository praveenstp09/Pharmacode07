# PharmaCode07

> A modern, full-stack Computer-Based Test (CBT) examination simulator and pharmacy learning platform built for national and state-level pharmacist recruitment exams (GPAT, GSSSB, RRB, AIIMS, ESIC, and UPSSSC).

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-black?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Gateway-0C2340?style=flat-square&logo=razorpay&logoColor=blue)](https://razorpay.com/)

---

## 📌 Overview

**PharmaCode07** bridges the gap between traditional pharmacy education and competitive government recruitment exams. It delivers a high-fidelity Computer-Based Test (CBT) environment modeled after official state and national pharmacist recruitment examinations, combined with organized PCI curriculum study notes, solved Previous Year Question papers (PYQs), and targeted non-technical revision modules.

---

## 🚀 Core Features

### 1. 🖥️ Interactive CBT Exam Simulator
- **Standard Pharmacist CBT Interface**: Color-coded question states (*Answered*, *Not Answered*, *Marked for Review*, *Answered & Marked for Review*, *Not Visited*).
- **Exam Controls**: Real-time countdown timer, 5-minute low-time alert toasts, dynamic question palette, and auto-submission on expiry.
- **Scoring Engine**: Configurable positive and negative marking (standard -0.25 penalty).
- **Post-Exam Analytics**: Question-by-question review, time-spent analysis, category-wise breakdown, and comprehensive clinical explanations.

### 2. 📚 4 Learning Pillars
- **Test Series Packages**: Full-length exam packages grouped into 3 structured folders (*Model Papers*, *Previous Year Papers*, *Subject-Wise CBT Drills*).
- **Single Model Papers**: Standalone mock exams for rapid assessment and targeted practice.
- **Study Notes Packages**: Organized curriculum notes (PCI B.Pharm Sem 1–8, D.Pharm 1st/2nd Year, and Quick Revision PDFs) with integrated in-browser preview and watermarked downloads.
- **Non-Pharma Hub**: Comprehensive preparation for the non-technical sections (Reasoning, Numerical Ability, Monthly Current Affairs, and General Studies).

### 3. 🛒 E-Commerce & Access Control
- **User-Scoped Carts**: Cart state persists per authenticated user account, preventing data leakage on shared devices.
- **Duplicate Prevention**: Automatic guards prevent students from re-purchasing enrolled packages.
- **Dynamic Coupon Engine**: Percentage and flat-rate discount vouchers with atomic usage limits.
- **Payment Flows**: Razorpay payment integration with HMAC-SHA256 verification and instant free-checkout bypass for zero-cost orders.
- **Subscription Lifecycle**: Automatic 365-day validity management from date of purchase.

### 4. ⚙️ Admin Management Cockpit
- **Complete Content Management**: Create, publish, and edit test series, papers, questions, study packages, and non-pharma modules.
- **Bulk MCQ Importer**: Smart text parser that ingests raw questions, options, answers, and subjects into database-ready format.
- **Unpublished / Draft Mode**: Dedicated admin endpoints ensure drafts remain visible and editable prior to public release.
- **Analytics & Support**: Track revenue, enrolled students, active subscriptions, and contact inquiries.

---

## 🏗️ Architecture & Technical Highlights

- **Service-Layer Backend**: Business logic is separated from route controllers into dedicated services (`paymentService`, `testSeriesService`, `studyPackService`, `authService`, `adminService`), ensuring clean, modular code.
- **Unified Frontend Design System**: 10+ standardized components (`TestSeriesCard`, `StudyPackCard`, `SingleModelCard`, `HeroBanner`, `FilterPills`, `SearchInput`, `EmptyState`, `PriceDisplay`, `CouponForm`, `SEO`) eliminate duplicated markup across Home, Marketplaces, and Dashboards.
- **Concurrency & Idempotency**: Atomic MongoDB updates (`findOneAndUpdate`) protect order processing and coupon counters against race conditions.
- **Security Hardening**:
  - ReDoS protection via regex escaping on query filters.
  - Direct PDF scraping blocked on static uploads.
  - Question bank scraping limited to 25 randomized questions per practice request.
  - JWT algorithm pinned strictly to `HS256` with account lock verification.
  - Rate limiting on authentication, practice quizzes, and file downloads.
- **SEO & Social Optimization**:
  - Dynamic page titles, meta descriptions, and canonical links managed by `react-helmet-async`.
  - Rich Open Graph and Twitter Card previews for social sharing.
  - Static `robots.txt` and `sitemap.xml` configured for search engine indexing.

---

## 💻 Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, Tailwind CSS 3.4, React Router DOM 6, React Helmet Async, Lucide Icons, Axios |
| **Backend** | Node.js 18+ (ES Modules), Express.js 4.19, Mongoose 8.3 |
| **Database** | MongoDB Atlas |
| **Authentication**| JWT (JSON Web Tokens) with HS256, bcryptjs, OTP Verification |
| **Payments** | Razorpay Node.js SDK (HMAC SHA-256 signature validation) |
| **Storage & Email**| Cloudinary, Multer, Nodemailer (TLS) |
| **Security** | Helmet, express-rate-limit, express-mongo-sanitize, CORS policy |

---

## 📂 Project Structure

```
PharmaCode07/
├── backend/
│   ├── config/             # MongoDB connection & Cloudinary setup
│   ├── controllers/        # Request handling & response mapping
│   ├── middleware/         # Auth (protect, adminOnly), Rate Limiters, Upload
│   ├── models/             # Mongoose schemas (User, TestSeries, TestPaper, Order, etc.)
│   ├── routes/             # API route definitions
│   ├── scripts/            # Database CLI seeders & utilities
│   ├── services/           # Business logic layer (payments, test series, study packs)
│   ├── utils/              # Email notifier, upload helpers
│   ├── server.js           # Express app bootstrap
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets, favicon, robots.txt, sitemap.xml
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/      # Admin tabs (Test Series, Study Packs, etc.)
│   │   │   ├── auth/       # OTP modal & authentication helpers
│   │   │   ├── common/     # Reusable UI system (Cards, HeroBanner, SEO, Pills)
│   │   │   ├── layout/     # Navbar, Footer, Mobile Bottom Navigation
│   │   │   └── test/       # CBT Question Card, Quiz Timer, Palette
│   │   ├── constants/      # Exam categories & PCI curriculum definitions
│   │   ├── context/        # AuthContext, CartContext, ToastContext
│   │   ├── pages/          # Application routes & screens
│   │   ├── services/       # Centralized Axios client
│   │   ├── App.jsx         # Route registry & ProtectedRoute guards
│   │   └── main.jsx        # App mounting with HelmetProvider
│   ├── index.html          # HTML entry with default SEO meta
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml             # Render infrastructure blueprint
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB Atlas** account or local MongoDB instance
- **Razorpay** test keys (for checkout integration)

### 1. Clone Repository
```bash
git clone https://github.com/praveenstp09/Pharmacode07.git
cd Pharmacode07
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
```

Populate `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pharmacode?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourRazorpaySecret
EMAIL_SERVICE=gmail
EMAIL_USER=pharmacode07exams@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=Pharmacode07 <pharmacode07exams@gmail.com>
```

Start the backend:
```bash
npm run dev
# Server running at http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
# App running at http://localhost:5173
```

<!-- > 💡 **Zero-Config Frontend**: No `.env` file is required for local frontend development! Vite's dev server automatically proxies all `/api` network requests directly to `http://localhost:5000` (configured in `vite.config.js`). Furthermore, Razorpay checkout keys are dynamically provisioned by the backend server on order creation. -->

---

## 📡 API Overview

| Module | Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Register student account | Public |
| | `POST` | `/api/auth/login` | Student / Admin login | Public |
| | `GET` | `/api/auth/me` | Current profile & purchases | User |
| | `POST` | `/api/auth/verify-email` | Verify email with OTP | Public |
| **Test Series**| `GET` | `/api/test-series` | List published test packages | Public |
| | `GET` | `/api/test-series/:id` | Package details & folder content | Optional |
| | `GET` | `/api/test-series/paper/:id`| Exam questions for CBT attempt | Enrolled |
| | `GET` | `/api/test-series/practice-mcqs`| Capped free practice questions | Public |
| **CBT Attempts**| `POST` | `/api/attempts/submit` | Submit test attempt & grade | User |
| | `GET` | `/api/attempts/:id` | View scorecard & rationales | User |
| **Study Notes**| `GET` | `/api/materials/packs` | List study notes packages | Public |
| | `GET` | `/api/materials/packs/:slug`| Get study pack details | Optional |
| **Single Models**| `GET` | `/api/single-models` | List standalone CBT papers | Public |
| **Non-Pharma** | `GET` | `/api/non-pharma` | List aptitude/reasoning items | Public |
| **Payments** | `POST` | `/api/payments/create-order` | Create verified Razorpay order | User |
| | `POST` | `/api/payments/verify` | Verify HMAC signature & enroll | User |
| | `POST` | `/api/payments/free-checkout`| Zero-cost enrollment | User |
| | `POST` | `/api/coupons/apply` | Validate discount voucher | User |
| **Admin** | `GET` | `/api/admin/test-series` | List all series (with drafts) | Admin |
| | `POST` | `/api/admin/test-series` | Create / update test series | Admin |
| | `POST` | `/api/admin/test-papers` | Create paper & question bank | Admin |
| | `GET` | `/api/admin/stats` | Analytics & revenue overview | Admin |

---

## 🌐 Production Deployment

The platform is pre-configured for automated continuous deployment on [Render](https://render.com/) via [`render.yaml`](./render.yaml):

1. **Backend Web Service**: Node.js environment running `npm install && npm start` on `backend/`.
2. **Frontend Static Site**: Built with `npm install && npm run build` from `frontend/dist`, configured with SPA client rewrite rules.

---

## 🤝 Support & Contact

For support, partnership inquiries, or exam questions:
- **Email**: [pharmacode07exams@gmail.com](mailto:pharmacode07exams@gmail.com)

---

<p align="center">
  Built with dedication for pharmacy students & competitive exam aspirants across India 🇮🇳<br>
  <strong>PharmaCode07 &copy; 2026</strong>
</p>
