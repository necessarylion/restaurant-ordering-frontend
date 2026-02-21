import { useCartStore, selectItemCount, selectTotal } from "@/stores/cartStore";

export const useCart = () => {
  const store = useCartStore();
  return {
    ...store,
    itemCount: selectItemCount(store),
    total: selectTotal(store),
  };
};
