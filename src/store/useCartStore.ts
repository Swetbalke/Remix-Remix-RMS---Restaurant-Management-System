import { create } from 'zustand';
import { MenuItem, OrderItem } from '../types';

interface CartState {
  items: OrderItem[];
  tableId: string | null;
  setTableId: (id: string | null) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  updateQuantity: (itemId: string, quantity: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  tableId: null,
  setTableId: (id) => set({ tableId: id }),
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.menuItemId === item.id);
    if (existing) {
      return {
        items: state.items.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      };
    }
    return {
      items: [...state.items, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }],
    };
  }),
  removeItem: (itemId) => set((state) => ({
    items: state.items.filter((i) => i.menuItemId !== itemId),
  })),
  clearCart: () => set({ items: [] }),
  updateQuantity: (itemId, quantity) => set((state) => ({
    items: state.items.map((i) =>
      i.menuItemId === itemId ? { ...i, quantity: Math.max(0, quantity) } : i
    ).filter(i => i.quantity > 0),
  })),
}));
