import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileCheck, BookOpen, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { itemCount } = useCart();

  const isCurrent = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Test Series', path: '/test-series', icon: FileCheck },
    { label: 'Materials', path: '/materials', icon: BookOpen },
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Cart', path: '/cart', icon: ShoppingCart, badge: itemCount },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 py-2 px-3 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isCurrent(item.path);

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition ${
                active ? 'text-blue-600 font-extrabold' : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${active ? 'text-blue-600 stroke-[2.5]' : 'text-slate-500'}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-blue-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;
