import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartKey = (u) => {
  if (u && (u.id || u._id)) {
    return `pharmacode_cart_${u.id || u._id}`;
  }
  return 'pharmacode_cart_guest';
};

const loadCartFromStorage = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    localStorage.removeItem(key);
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeKey, setActiveKey] = useState(() => getCartKey(user));
  const [items, setItems] = useState(() => loadCartFromStorage(getCartKey(user)));
  const [coupon, setCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  // Sync cart when user logs in, logs out, or switches accounts
  useEffect(() => {
    const newKey = getCartKey(user);
    setActiveKey(newKey);
    let loadedItems = loadCartFromStorage(newKey);

    // If user is logged in, filter out items that this user has already purchased
    if (user) {
      const userTests = user.purchasedTests || [];
      const userMaterials = user.purchasedMaterials || [];
      const userSingleModels = user.purchasedSingleModels || [];
      const userNonPharma = user.purchasedNonPharma || [];

      loadedItems = loadedItems.filter(item => {
        const itemIdStr = (item.id || item._id || item.itemId || '').toString();
        if (item.type === 'TestSeries' && userTests.some(id => (id?._id || id)?.toString() === itemIdStr)) return false;
        if (item.type === 'StudyMaterial' && userMaterials.some(id => (id?._id || id)?.toString() === itemIdStr)) return false;
        if (item.type === 'SingleModelPaper' && userSingleModels.some(id => (id?._id || id)?.toString() === itemIdStr)) return false;
        if (item.type === 'NonPharmaResource' && userNonPharma.some(id => (id?._id || id)?.toString() === itemIdStr)) return false;
        return true;
      });
    }

    setItems(loadedItems);
    setCoupon(null);
    setDiscountAmount(0);
  }, [user]);

  // Persist items to current active user storage key
  useEffect(() => {
    try {
      localStorage.setItem(activeKey, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
    if (coupon) {
      recalculateDiscount(coupon, items);
    }
  }, [items, activeKey]);

  const addToCart = (item, customType = null) => {
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

    const basePrice = Number(item.price || 0);
    const sellingPrice = item.discountPrice !== undefined && item.discountPrice !== null ? Number(item.discountPrice) : basePrice;
    const finalChargedPrice = (basePrice > 0 && sellingPrice > 0) ? Math.min(basePrice, sellingPrice) : sellingPrice;

    const newItem = {
      id,
      _id: id,
      itemId: id,
      title: item.title,
      price: finalChargedPrice,
      originalPrice: basePrice,
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
    localStorage.removeItem(activeKey);
    localStorage.removeItem('pharmacode_cart');
    localStorage.removeItem('pharmacode_cart_guest');
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
