import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

import Banner from './components/layout/Banner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import BackToTop from './components/common/BackToTop';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

// Core eager route for instant first contentful paint
import Home from './pages/Home';

// On-demand code-split routes (Loaded on navigation for optimal performance)
const TestSeriesMarketplace = lazy(() => import('./pages/TestSeriesMarketplace'));
const TestSeriesDetail = lazy(() => import('./pages/TestSeriesDetail'));
const PracticeQuiz = lazy(() => import('./pages/PracticeQuiz'));
const PYQs = lazy(() => import('./pages/PYQs'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TestAttemptScreen = lazy(() => import('./pages/TestAttemptScreen'));
const TestResult = lazy(() => import('./pages/TestResult'));
const StudyMaterials = lazy(() => import('./pages/StudyMaterials'));
const SingleModelPapers = lazy(() => import('./pages/SingleModelPapers'));
const NonPharmaHub = lazy(() => import('./pages/NonPharmaHub'));

// Lazy load legal pages from named exports
const PrivacyPolicy = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.PrivacyPolicy })));
const Terms = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.Terms })));
const RefundPolicy = lazy(() => import('./pages/LegalPages').then(m => ({ default: m.RefundPolicy })));

// Smooth Suspense Page Loader
const PageLoader = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-12">
    <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">Loading PharmaCode07...</span>
  </div>
);

// Auto-scroll to top on page navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
};

// Layout wrapper to conditionally hide navbar/footer during full-screen CBT test attempt
const Layout = ({ children }) => {
  const location = useLocation();
  const isTestAttempt = location.pathname.startsWith('/attempt/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {!isTestAttempt && <Banner />}
      {!isTestAttempt && <Navbar />}
      <main className={`flex-grow ${!isTestAttempt ? 'pb-16 md:pb-0' : ''}`}>{children}</main>
      {!isTestAttempt && <Footer />}
      {!isTestAttempt && <MobileBottomNav />}
      {!isTestAttempt && <BackToTop />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <ScrollToTop />
              <Layout>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/test-series" element={<TestSeriesMarketplace />} />
                    <Route path="/test-series/:slug" element={<TestSeriesDetail />} />
                    <Route
                      path="/attempt/:paperId"
                      element={
                        <ProtectedRoute>
                          <TestAttemptScreen />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/result/:attemptId"
                      element={
                        <ProtectedRoute>
                          <TestResult />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/practice" element={<PracticeQuiz />} />
                    <Route path="/materials" element={<StudyMaterials />} />
                    <Route path="/model-papers" element={<SingleModelPapers />} />
                    <Route path="/non-pharma" element={<NonPharmaHub />} />
                    <Route path="/pyqs" element={<PYQs />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route
                      path="/checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute adminOnly={true}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />
                    <Route
                      path="*"
                      element={
                        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                          <h1 className="text-4xl font-extrabold text-slate-800">404</h1>
                          <p className="text-slate-500 text-sm mt-2">Page Not Found</p>
                        </div>
                      }
                    />
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
