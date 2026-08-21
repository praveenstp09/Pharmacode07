import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Test Series', path: '/test-series' },
    { name: 'Study Materials', path: '/materials' },
    { name: 'Model Papers', path: '/model-papers' },
    { name: 'Non-Pharma', path: '/non-pharma' },
    { name: 'Free Quizzes', path: '/practice' },
  ];

  const isActive = path => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo Branding */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0 group">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center p-0.5 group-hover:scale-105 transition transform">
              <img
                src="/logo.png"
                alt="PharmaCode07"
                className="h-full w-full object-contain"
              />
            </div>
            <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 leading-none">
              PharmaCode<span className="text-blue-600">07</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-2.5 xl:px-3.5 py-2 rounded-xl text-xs xl:text-sm font-bold whitespace-nowrap transition ${
                  isActive(link.path)
                    ? 'text-blue-600 bg-blue-50/90 font-extrabold'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Buttons / User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50 hover:bg-blue-50 text-slate-800 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs sm:text-sm font-bold truncate max-w-[100px]">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition"
                    >
                      <LayoutDashboard className="w-4 h-4 text-blue-600" />
                      <span>Student Dashboard</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs sm:text-sm font-bold text-indigo-700 hover:bg-indigo-50 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition border-t border-slate-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition whitespace-nowrap"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center space-x-1 sm:hidden">
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-blue-600 rounded-xl"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-1.5">
          {navLinks.map(link => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-xl text-sm font-bold ${
                isActive(link.path)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-blue-600 font-bold rounded-xl bg-blue-50 text-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Student Dashboard</span>
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 text-indigo-700 font-bold rounded-xl bg-indigo-50 text-sm"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-rose-600 font-bold rounded-xl hover:bg-rose-50 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center py-2 text-xs font-bold text-white bg-blue-600 rounded-xl shadow"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
