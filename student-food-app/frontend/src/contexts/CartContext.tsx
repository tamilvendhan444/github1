'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { MenuItem, Cart, CartItem } from '@/types';

interface CartContextType {
  cart: Cart;
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { item: MenuItem; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: Cart };

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        (cartItem) => cartItem.menuItem._id === item._id
      );

      let newItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        newItems = state.items.map((cartItem, index) =>
          index === existingItemIndex
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                subtotal: (cartItem.quantity + quantity) * item.price,
              }
            : cartItem
        );
      } else {
        // New item, add to cart
        newItems = [
          ...state.items,
          {
            menuItem: item,
            quantity,
            subtotal: quantity * item.price,
          },
        ];
      }

      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        totalAmount,
        totalItems,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(
        (item) => item.menuItem._id !== action.payload
      );
      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        totalAmount,
        totalItems,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: itemId });
      }

      const newItems = state.items.map((item) =>
        item.menuItem._id === itemId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.menuItem.price,
            }
          : item
      );

      const totalAmount = newItems.reduce((sum, item) => sum + item.subtotal, 0);
      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);

      return {
        items: newItems,
        totalAmount,
        totalItems,
      };
    }

    case 'CLEAR_CART':
      return {
        items: [],
        totalAmount: 0,
        totalItems: 0,
      };

    case 'LOAD_CART':
      return action.payload;

    default:
      return state;
  }
};

const initialCart: Cart = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, initialCart);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('studentFoodCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('studentFoodCart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item: MenuItem, quantity = 1) => {
    if (!item.isAvailable) {
      toast.error('This item is currently not available');
      return;
    }

    dispatch({ type: 'ADD_ITEM', payload: { item, quantity } });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  const getTotalItems = () => cart.totalItems;

  const getTotalAmount = () => cart.totalAmount;

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalAmount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};