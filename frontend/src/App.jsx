import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import Banner from './components/layout/Banner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import TestSeriesMarketplace from './pages/TestSeriesMarketplace';
import TestSeriesDetail from './pages/TestSeriesDetail';
import TestAttemptScreen from './pages/TestAttemptScreen';
import TestResult from './pages/TestResult';
import PracticeQuiz from './pages/PracticeQuiz';
import StudyMaterials from './pages/StudyMaterials';
import PYQs from './pages/PYQs';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import About from './pages/About';
import Contact from './pages/Contact';
import { PrivacyPolicy, Terms, RefundPolicy } from './pages/LegalPages';

// Layout wrapper to conditionally hide navbar/footer during full-screen CBT test attempt
const Layout = ({ children }) => {
  const location = useLocation();
  const isTestAttempt = location.pathname.startsWith('/attempt/');

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {!isTestAttempt && <Banner />}
      {!isTestAttempt && <Navbar />}
      <main className="flex-grow">{children}</main>
      {!isTestAttempt && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/test-series" element={<TestSeriesMarketplace />} />
              <Route path="/test-series/:slug" element={<TestSeriesDetail />} />
              <Route path="/attempt/:paperId" element={<TestAttemptScreen />} />
              <Route path="/result/:attemptId" element={<TestResult />} />
              <Route path="/practice" element={<PracticeQuiz />} />
              <Route path="/materials" element={<StudyMaterials />} />
              <Route path="/pyqs" element={<PYQs />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />
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
          </Layout>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
