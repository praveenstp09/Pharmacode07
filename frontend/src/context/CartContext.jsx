import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('pharmacode_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    localStorage.setItem('pharmacode_cart', JSON.stringify(items));
    if (coupon) {
      recalculateDiscount(coupon, items);
    }
  }, [items]);

  const addToCart = item => {
    // Check if already in cart
    const exists = items.some(i => i.id === (item._id || item.id));
    if (!exists) {
      const newItem = {
        id: item._id || item.id,
        title: item.title,
        price: item.discountPrice !== undefined ? item.discountPrice : item.price,
        originalPrice: item.price,
        type: item.totalTests !== undefined ? 'TestSeries' : 'StudyMaterial',
        thumbnail: item.thumbnail || '/placeholder-test.jpg',
        examType: item.examType || '',
      };
      setItems(prev => [...prev, newItem]);
    }
  };

  const removeFromCart = id => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setDiscountAmount(0);
    localStorage.removeItem('pharmacode_cart');
  };

  const subtotal = items.reduce((acc, curr) => acc + curr.price, 0);

  const recalculateDiscount = (couponData, currentItems) => {
    const currentSubtotal = currentItems.reduce((acc, curr) => acc + curr.price, 0);
    let disc = (currentSubtotal * couponData.discountPercent) / 100;
    if (couponData.maxDiscount && disc > couponData.maxDiscount) {
      disc = couponData.maxDiscount;
    }
    setDiscountAmount(Math.round(disc));
  };

  const applyCoupon = async code => {
    try {
      const res = await api.post('/coupons/validate', {
        code,
        orderAmount: subtotal,
      });
      if (res.data.success) {
        setCoupon(res.data.data);
        setDiscountAmount(res.data.data.discountAmount);
        return { success: true, message: `Coupon ${code} applied successfully!` };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to apply coupon',
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
  };

  const total = Math.max(0, subtotal - discountAmount);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        subtotal,
        discountAmount,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
        itemCount: items.length,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
