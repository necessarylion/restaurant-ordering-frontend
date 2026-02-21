import { create } from "zustand";
import type { CartItem, MenuItem } from "@/types";

interface CartState {
  items: CartItem[];
  tableToken: string | null;
  restaurantId: number | null;
  addItem: (menuItem: MenuItem, quantity: number, notes?: string) => void;
  removeItem: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateNotes: (menuItemId: number, notes: string) => void;
  clear: () => void;
  setTableToken: (token: string, restaurantId: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  tableToken: null,
  restaurantId: null,

  setTableToken: (token, restaurantId) => {
    set({ tableToken: token, restaurantId });
  },

  addItem: (menuItem, quantity, notes) => {
    set((state) => {
      const existingIndex = state.items.findIndex(
        (item) => item.menu_item.id === menuItem.id
      );

      if (existingIndex !== -1) {
        const newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + quantity,
          notes: notes || newItems[existingIndex].notes,
        };
        return { items: newItems };
      }

      return { items: [...state.items, { menu_item: menuItem, quantity, notes }] };
    });
  },

  removeItem: (menuItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.menu_item.id !== menuItemId),
    }));
  },

  updateQuantity: (menuItemId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return {
          items: state.items.filter((item) => item.menu_item.id !== menuItemId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.menu_item.id === menuItemId ? { ...item, quantity } : item
        ),
      };
    });
  },

  updateNotes: (menuItemId, notes) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.menu_item.id === menuItemId ? { ...item, notes } : item
      ),
    }));
  },

  clear: () => {
    set({ items: [] });
  },
}));

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotal = (state: CartState) =>
  state.items.reduce(
    (sum, item) => sum + item.menu_item.price * item.quantity,
    0
  );
