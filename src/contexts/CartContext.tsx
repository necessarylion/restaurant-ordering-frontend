/**
 * Cart Context
 * Manages guest ordering cart (session-only, not persisted)
 */

import React, { createContext, useState, useCallback, useMemo } from "react";
import type { CartItem, MenuItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  tableToken: string | null;
  restaurantId: number | null;
  itemCount: number;
  total: number;
  addItem: (menuItem: MenuItem, quantity: number, notes?: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateNotes: (menuItemId: number, notes: string) => void;
  clear: () => void;
  setTableToken: (token: string, restaurantId: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [tableToken, setTableTokenState] = useState<string | null>(null);
  const [restaurantId, setRestaurantIdState] = useState<number | null>(null);

  const setTableToken = useCallback((token: string, restaurantId: number) => {
    setTableTokenState(token);
    setRestaurantIdState(restaurantId);
  }, []);

  const addItem = useCallback(
    (menuItem: MenuItem, quantity: number, notes?: string) => {
      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) => item.menu_item.id === menuItem.id
        );

        if (existingIndex !== -1) {
          // Update existing item
          const newItems = [...prevItems];
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + quantity,
            notes: notes || newItems[existingIndex].notes,
          };
          return newItems;
        } else {
          // Add new item
          return [...prevItems, { menu_item: menuItem, quantity, notes }];
        }
      });
    },
    []
  );

  const removeItem = useCallback((menuItemId: number) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.menu_item.id !== menuItemId)
    );
  }, []);

  const updateQuantity = useCallback((menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prevItems) =>
        prevItems.filter((item) => item.menu_item.id !== menuItemId)
      );
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.menu_item.id === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const updateNotes = useCallback((menuItemId: number, notes: string) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.menu_item.id === menuItemId ? { ...item, notes } : item
      )
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.menu_item.price * item.quantity,
        0
      ),
    [items]
  );

  const value: CartContextValue = {
    items,
    tableToken,
    restaurantId,
    itemCount,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clear,
    setTableToken,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
