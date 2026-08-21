import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-lg border border-slate-700 flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="PharmaCode07"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">
                PharmaCode<span className="text-blue-400">07</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              India's premier online pharmacy competitive exam preparation platform. Specialized in high-yield Model Papers, Mock Test Series, PYQs, and Revision Notes for GSSSB, UPSSSC, RRB, AIIMS, and GPAT aspirants.
            </p>
            <div className="pt-2 space-y-2">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <a href="mailto:royaldcx07031999@gmail.com" className="hover:text-white transition font-medium">
                  royaldcx07031999@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Exam Test Series</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/test-series?exam=GSSSB" className="hover:text-blue-400 transition">
                  GSSSB Junior Pharmacist
                </Link>
              </li>
              <li>
                <Link to="/test-series?exam=UPSSSC" className="hover:text-blue-400 transition">
                  UPSSSC Pharmacist 2026
                </Link>
              </li>
              <li>
                <Link to="/test-series?exam=RRB" className="hover:text-blue-400 transition">
                  RRB Pharmacist Mock Tests
                </Link>
              </li>
              <li>
                <Link to="/test-series?exam=AIIMS" className="hover:text-blue-400 transition">
                  AIIMS Pharmacist Papers
                </Link>
              </li>
              <li>
                <Link to="/practice" className="hover:text-blue-400 transition">
                  Daily Free MCQ Practice
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Study Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/materials" className="hover:text-blue-400 transition">
                  PDF Notes & Revision Sheets
                </Link>
              </li>
              <li>
                <Link to="/pyqs" className="hover:text-blue-400 transition">
                  Previous Year Papers (PYQs)
                </Link>
              </li>
              <li>
                <Link to="/materials?category=Drug+Lists" className="hover:text-blue-400 transition">
                  Pharmacology Drug Charts
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition">
                  About Pharmacode07
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Contact Support & Help
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase">Trust & Legal</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/privacy-policy" className="hover:text-blue-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-blue-400 transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-blue-400 transition">
                  Refund & Cancellation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-400 transition">
                  Student Grievance
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 PharmaCode07. All Rights Reserved.</p>
          <p className="flex items-center">
            Dedicated to Indian Pharmacy Students & Aspirants
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
