'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import type { Product } from '@/types/database';

export interface CartItem {
  id: string; // matches product.id
  name: string;
  slug: string;
  price: number;
  stock_quantity: number;
  image_url: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  total: number;
  isInitialized: boolean;
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
}

const CART_STORAGE_KEY = 'mini_ecommerce_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever items change (only after initialized)
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items, isInitialized]);

  const addItem = useCallback(
    (product: Product, quantity: number = 1): { success: boolean; message?: string } => {
      if (product.stock_quantity <= 0) {
        return { success: false, message: 'Produk sedang habis.' };
      }

      let resultMessage: string | undefined;
      let success = true;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex((item) => item.id === product.id);

        if (existingIndex > -1) {
          const currentItem = prevItems[existingIndex];
          const newQuantity = currentItem.quantity + quantity;

          if (newQuantity > product.stock_quantity) {
            resultMessage = `Jumlah melebihi stok tersedia (${product.stock_quantity} unit).`;
            const updated = [...prevItems];
            updated[existingIndex] = {
              ...currentItem,
              quantity: product.stock_quantity,
              stock_quantity: product.stock_quantity,
              price: product.price,
            };
            return updated;
          }

          const updated = [...prevItems];
          updated[existingIndex] = {
            ...currentItem,
            quantity: newQuantity,
            stock_quantity: product.stock_quantity,
            price: product.price,
          };
          return updated;
        }

        // Add new item
        const initialQty = Math.min(Math.max(1, quantity), product.stock_quantity);
        if (quantity > product.stock_quantity) {
          resultMessage = `Hanya dapat menambahkan hingga batas stok (${product.stock_quantity} unit).`;
        }

        return [
          ...prevItems,
          {
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url,
            quantity: initialQty,
          },
        ];
      });

      return { success, message: resultMessage };
    },
    []
  );

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== productId);
      }

      return prevItems.map((item) => {
        if (item.id === productId) {
          const clampedQty = Math.min(quantity, item.stock_quantity);
          return {
            ...item,
            quantity: clampedQty,
          };
        }
        return item;
      });
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getItemQuantity = useCallback(
    (productId: string) => {
      const found = items.find((item) => item.id === productId);
      return found ? found.quantity : 0;
    },
    [items]
  );

  const totalItems = useMemo(() => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [items]);

  // Sesuai PRD dan schema.sql (constraint orders_total_matches_subtotal check (total = subtotal))
  const total = useMemo(() => {
    return subtotal;
  }, [subtotal]);

  const contextValue = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      total,
      isInitialized,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    }),
    [
      items,
      totalItems,
      subtotal,
      total,
      isInitialized,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      getItemQuantity,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

