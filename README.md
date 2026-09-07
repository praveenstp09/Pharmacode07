# 💊 PharmaCode07 - Pharmacy CBT Exam & Learning Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay&logoColor=blue)](https://razorpay.com/)

> **PharmaCode07** is a full-stack, production-grade Computer Based Test (CBT) examination simulator, test series marketplace, and study resource portal purpose-built for Indian Government & State Pharmacy Recruitment Examinations (including **GSSSB, AIIMS, ESIC, UPSSSC, OSSSC, RRB Pharmacist, and Drug Inspector exams**).

---

## 📑 Table of Contents

1. [Key Highlights & Architecture](#-key-highlights--architecture)
2. [The 4 Core Educational Pillars](#-the-4-core-educational-pillars)
3. [Features & Capabilities](#-features--capabilities)
   - [Real-Time CBT Exam Simulator](#-real-time-cbt-exam-simulator)
   - [E-Commerce & Smart Cart System](#-e-commerce--smart-cart-system)
   - [Payment Processing (Razorpay + Free Flow)](#-payment-processing-razorpay--free-flow)
   - [Student & Admin Dashboards](#-student--admin-dashboards)
4. [Tech Stack](#-tech-stack)
5. [Project Directory Structure](#-project-directory-structure)
6. [Database Schema & Models](#-database-schema--models)
7. [API Reference](#-api-reference)
8. [Local Development Setup](#-local-development-setup)
9. [Environment Variables](#-environment-variables)
10. [Production Deployment (Render)](#-production-deployment-render)
11. [Security & Optimization](#-security--optimization)
12. [Contributing & License](#-contributing--license)

---

## 🌟 Key Highlights & Architecture

- **Full Simulation of NTA / TCS-iON CBT Environment**: Accurate color-coded question palette, section navigation, question status flags, timer countdowns, and instant scorecard calculation.
- **Micro-Modular Product Structure**: Supports multi-item cart purchases, instant enrollments, coupon codes, and immediate digital access provisioning.
- **Production-Ready Security**: Helmet headers, express-rate-limiters, MongoDB query sanitization, signed Razorpay webhooks/callbacks, and role-based access control (RBAC).
- **Responsive & Modern UI**: Built with React 18, Vite, Tailwind CSS, and Lucide Icons with mobile-first bottom navigation for student convenience.

---

## 🏛 The 4 Core Educational Pillars

| Pillar | Description | Access Mode | Key Capabilities |
| :--- | :--- | :--- | :--- |
| **1. Comprehensive Test Series** | Full exam packages with organized sub-folders (*Full Mocks, Subject-Wise, Solved PYQs*). | Free / Paid (Razorpay) | Batch attempts, detailed explanations, leaderboards, folder-level access control. |
| **2. Single Model Papers** | Standalone exam mock papers for rapid testing and focused practice. | Free / Paid (Razorpay) | One-click CBT launch, instant result analysis, subject breakdown. |
| **3. Study Materials & Notes** | High-yield subject notes, pharmacological charts, and revision PDFs. | Free / Paid (Razorpay) | In-browser preview modal, secure direct PDF downloads, pricing validation ($SellingPrice \le MRP$). |
| **4. Non-Pharma Hub** | Non-technical subjects (Reasoning, Quantitative Aptitude, General Knowledge, Gujarati/English). | Free / Paid (Razorpay) | Dedicated CBT practice tests, multi-topic syllabus coverage, seamless attempt tracking. |

---

## 🚀 Features & Capabilities

### 🖥 Real-Time CBT Exam Simulator
- **Exact CBT Layout**: Color-coded question states (Answered, Not Answered, Marked for Review, Visited/Not Visited).
- **Time Management**: Per-question time tracking, floating countdown timer with 5-minute low-time warnings, and automatic submission upon expiry.
- **Real-Time Question Palette**: Quick jumping between questions with instant visual indicators.
- **Negative & Positive Marking**: Automatic grading considering custom exam marks and negative penalties.
- **Comprehensive Analysis**: Post-exam review showing time spent, score percentages, rank, accuracy, and detailed step-by-step solution rationales.

### 🛒 E-Commerce & Smart Cart System
- **User-Scoped Cart Storage**: Cart items are isolated per authenticated user ID (`pharmacode_cart_${userId}`) to ensure multi-account privacy on shared devices.
- **Duplicate Prevention**: Prevents adding previously purchased or already enrolled items to cart.
- **Coupon Engine**: Supports both percentage-based (`percent`) and flat cash discount (`flat`) promo codes.

### 💳 Payment Processing (Razorpay + Free Flow)
- **Zero-Cost Instant Checkout**: Automatically skips gateway popups for 100% free courses or items with 100% coupon discounts.
- **Secure Razorpay Integration**: HMAC SHA-256 signature verification on backend prevents tampering.
- **Automatic Access Provisioning**: Instantly updates user profile arrays (`purchasedTests`, `purchasedMaterials`, `purchasedSingleModels`, `purchasedNonPharma`) upon payment completion.

### 📊 Student & Admin Dashboards
- **Student Dashboard**: Clean, unified cockpit displaying strictly purchased study notes, active test series, model papers, recent test performance, and quick-resume shortcuts.
- **Admin Dashboard**:
  - Full CRUD operations for Test Series, Test Papers, Questions, Study Materials, Single Models, and Non-Pharma items.
  - **MCQ Bulk Importer**: Intelligent bulk parser to ingest batches of MCQs from raw text into structured JSON with options and answers.
  - Media & PDF upload management with Cloudinary/Multer integration.
  - Live revenue metrics, student purchase histories, and contact inquiry viewer.

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 (SPA)
- **Build Tool**: Vite 5.2
- **Styling**: Tailwind CSS 3.4 & Autoprefixer
- **Routing**: React Router DOM v6
- **Icons**: Lucide React
- **HTTP Client**: Axios (with custom JWT & error interceptors)
- **Effects**: Canvas Confetti (celebration animations on checkout & high scores)

### Backend
- **Runtime**: Node.js (v18+) with ES Modules (`type: module`)
- **Web Framework**: Express.js 4.19
- **Database**: MongoDB Atlas via Mongoose ODM 8.3
- **Authentication**: JWT (JSON Web Tokens) & `bcryptjs`
- **Payment Gateway**: Razorpay Node.js SDK
- **File & Media Storage**: Cloudinary SDK & Multer (with MIME validation)
- **Email Service**: Nodemailer (password reset & notifications)
- **Security & Performance**: `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `compression`, `morgan`

---

## 📂 Project Directory Structure

```
PharmaCode07/
├── backend/
│   ├── config/             # DB & Cloudinary configuration
│   ├── controllers/        # Express request controllers (Auth, Payment, Admin, Tests, etc.)
│   ├── middleware/         # Auth (protect, adminOnly, optionalAuth), Rate Limiters, Upload
│   ├── models/             # 13 Mongoose Schemas (User, TestSeries, TestPaper, Attempt, etc.)
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Bulk seeders, verification helpers, upload handlers
│   ├── server.js           # Main Express server entry point
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets, logos, and favicon
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, Modals, CBT Palette, Timer)
│   │   ├── context/        # React Contexts (AuthContext, CartContext, ToastContext)
│   │   ├── pages/          # 21 Application Pages (Home, CBT Screens, Dashboards, Materials)
│   │   ├── services/       # Centralized Axios API service layer
│   │   ├── App.jsx         # App router & layout configuration
│   │   └── main.jsx        # React root mounting
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── render.yaml             # Render Infrastructure-as-Code blueprint
├── package.json            # Monorepo build orchestrator
└── README.md               # Project documentation
```

---

## 🗄 Database Schema & Models

| Model | File | Primary Responsibility |
| :--- | :--- | :--- |
| **User** | `backend/models/User.js` | Student/Admin profiles, credentials, access arrays, reset tokens. |
| **TestSeries** | `backend/models/TestSeries.js` | Full test package metadata, pricing, target exams, highlight bullets. |
| **TestPaper** | `backend/models/TestPaper.js` | Exam metadata, question bank, durations, positive/negative marks. |
| **TestAttempt** | `backend/models/TestAttempt.js` | Detailed student answers, question time logs, final scores, percentiles. |
| **FolderItem** | `backend/models/FolderItem.js` | Organizes tests/PDFs inside Test Series packages (*cbt_mixed, pyq, subject_wise*). |
| **SingleModelPaper**| `backend/models/SingleModelPaper.js`| Standalone mock papers for individual purchase or free access. |
| **StudyMaterial** | `backend/models/StudyMaterial.js` | PDF notes, revision handouts, pricing, page counts, preview links. |
| **NonPharmaResource**|`backend/models/NonPharmaResource.js`| Non-technical syllabus modules, aptitude/reasoning CBT tests. |
| **Order** | `backend/models/Order.js` | E-commerce transaction records, Razorpay order IDs, item breakdowns. |
| **Purchase** | `backend/models/Purchase.js` | Historical ledger of granted access per user. |
| **Coupon** | `backend/models/Coupon.js` | Promotional discount vouchers with usage limits & expiry dates. |
| **Contact** | `backend/models/Contact.js` | Contact form inquiries and student support tickets. |
| **Notification** | `backend/models/Notification.js` | Broadcast and student alert notices. |

---

## 🌐 API Reference

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account.
- `POST /api/auth/login` — Authenticate and receive JWT token.
- `GET  /api/auth/me` — Retrieve current user profile & purchased assets (Protected).
- `POST /api/auth/forgot-password` — Request password reset email.
- `PUT  /api/auth/reset-password/:token` — Update password using reset token.

### 2. Test Series & Exams (`/api/test-series`, `/api/attempts`)
- `GET  /api/test-series` — Get all published test packages (supports search & filters).
- `GET  /api/test-series/:id` — Get package details and unlocked folder structure.
- `GET  /api/test-series/paper/:id` — Fetch sanitized exam paper for CBT attempt.
- `POST /api/attempts/submit` — Submit completed exam attempt and calculate scorecard.
- `GET  /api/attempts/:id` — Retrieve detailed scorecard and solution analysis.
- `GET  /api/attempts/user/my-attempts` — List all past attempts for logged-in user.

### 3. Study Materials & Single Models (`/api/materials`, `/api/single-models`, `/api/non-pharma`)
- `GET  /api/materials` — List all study notes and revision PDFs.
- `GET  /api/single-models` — List standalone single mock papers.
- `GET  /api/non-pharma` — List non-pharma syllabus modules & tests.

### 4. Payments & Cart (`/api/payments`, `/api/coupons`)
- `POST /api/payments/create-order` — Initialize Razorpay order with server-verified total.
- `POST /api/payments/verify` — Verify Razorpay signature and grant instant access.
- `POST /api/payments/free-checkout` — Zero-cost enrollment for free items / 100% discount.
- `POST /api/coupons/apply` — Validate coupon code and return discount amount.

### 5. Admin Management (`/api/admin`)
- `POST /api/admin/test-series` — Create/update test series package.
- `POST /api/admin/test-papers` — Create test paper & question bank.
- `POST /api/admin/study-materials` — Upload and publish study notes PDF.
- `POST /api/admin/single-models` — Create single model mock test.
- `POST /api/admin/non-pharma` — Add non-pharma resource.
- `GET  /api/admin/stats` — System metrics, revenue figures, user counts.

---

## 🛠 Local Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or local MongoDB instance
- [Razorpay](https://razorpay.com/) test account (for payment integration)
- [Cloudinary](https://cloudinary.com/) account (for PDF and image hosting)

### 1. Clone the Repository
```bash
git clone https://github.com/praveenstp09/Pharmacode07.git
cd Pharmacode07
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment configuration file
cp .env.example .env   # Or create .env manually (see details below)

# (Optional) Seed the database with initial tests and materials
npm run seed

# Start backend in development mode with nodemon
npm run dev
```
The backend will start on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Create frontend environment configuration
cp .env.example .env   # Or create .env manually (see details below)

# Start Vite development server
npm run dev
```
The frontend will start on `http://localhost:5173`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
```env
# Server Config
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pharmacode?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d

# Razorpay Payment Gateway
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpayKeySecretHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=pharmacode07exam@gmail.com
EMAIL_PASS=your_app_specific_email_password
EMAIL_FROM=Pharmacode07 <pharmacode07exam@gmail.com>
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
```

---

## 🚀 Production Deployment (Render)

This repository includes a native `render.yaml` blueprint for automated zero-configuration deployment on [Render](https://render.com/).

### Deployment Steps:
1. Push your repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and navigate to **Blueprints**.
3. Connect your repository and select `render.yaml`.
4. Render will automatically provision two services:
   - **`pharmacode07-backend`** (Node.js Web Service)
   - **`pharmacode07-frontend`** (Static Site with SPA rewrite rules)
5. Fill in the required environment variables in Render's dashboard (`MONGO_URI`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL`, `VITE_API_URL`).

---

## 🔒 Security & Optimization

- **NoSQL Injection Defense**: `express-mongo-sanitize` automatically strips `$` and `.` from requests.
- **Brute-Force & DoS Mitigation**: `express-rate-limit` protects login, registration, and payment endpoints.
- **Data Protection**: Strict HTTP security headers enabled via `helmet`.
- **Response Optimization**: Gzip/Brotli payload compression enabled via `compression` middleware.
- **Content Gating**: Locked exam papers and study PDFs are stripped from API payloads unless verified by active user enrollment.

---

## 🤝 Contributing & Support

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

**Contact Support**: [pharmacode07exams@gmail.com](mailto:pharmacode07exams@gmail.com)

---

<p align="center">
  Made with ❤️ for Pharmacy Aspirants across India &bull; <strong>PharmaCode07</strong>
</p>
