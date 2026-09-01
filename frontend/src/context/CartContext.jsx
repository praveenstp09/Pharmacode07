import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmacode_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      localStorage.removeItem('pharmacode_cart');
      return [];
    }
  });
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('pharmacode_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
    if (coupon) {
      recalculateDiscount(coupon, items);
    }
  }, [items]);

  const addToCart = (item, customType = null) => {
    // Check if already in cart
    const id = item._id || item.id;
    const exists = items.some(i => i.id === id);
    if (exists) {
      return { added: false, message: 'Item is already in your cart' };
    }

    let resolvedType = customType;
    if (!resolvedType) {
      if (item.totalTests !== undefined) resolvedType = 'TestSeries';
      else if (item.hasCBT !== undefined || item.totalQuestions !== undefined) resolvedType = 'SingleModelPaper';
      else if (item.courseType !== undefined) resolvedType = 'StudyMaterial';
      else resolvedType = 'StudyMaterial';
    }

    const newItem = {
      id,
      _id: id,
      itemId: id,
      title: item.title,
      price: item.discountPrice !== undefined && item.discountPrice !== null ? item.discountPrice : (item.price || 0),
      originalPrice: item.price || 0,
      type: resolvedType,
      itemType: resolvedType,
      thumbnail: item.thumbnail || '/placeholder-test.jpg',
      examType: item.examType || '',
    };
    setItems(prev => [...prev, newItem]);
    return { added: true, message: 'Added to cart successfully!' };
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
    if (!couponData) return;
    const currentSubtotal = currentItems.reduce((acc, curr) => acc + curr.price, 0);
    let disc = 0;
    if (couponData.discountPercent) {
      disc = (currentSubtotal * couponData.discountPercent) / 100;
    } else if (couponData.discountAmount) {
      disc = couponData.discountAmount;
    }
    if (couponData.maxDiscount && disc > couponData.maxDiscount) {
      disc = couponData.maxDiscount;
    }
    setDiscountAmount(Math.min(currentSubtotal, Math.round(disc)));
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
