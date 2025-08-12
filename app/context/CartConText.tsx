"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from "react";
import { fetchPromotions } from "../../lib/PromoApi";
import { fetchVariantById } from "@/lib/productApi";

export interface CartOption {
  name: string;
  value: string;
}

export interface CartProduct {
  promotionData?: any;
  promotion?: any;
  originalPrice: number;
  final_price_discount: any;
  sale_price: number | null;
  productId: number;
  id: number;
  name: string;
  image: string;
  price: number;
  variantId: number;
  options: CartOption[];
  quantity: number;
  discount: number;
  isGift?: boolean;
}

interface CartContextType {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (variantId: number, options: CartOption[]) => void;
  increaseQuantity: (variantId: number, options: CartOption[]) => void;
  decreaseQuantity: (variantId: number, options: CartOption[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "egomall_cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);
  const cartRef = useRef<CartProduct[]>([]); // chỉ chứa sản phẩm thật (không chứa quà)

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed: CartProduct[] = JSON.parse(stored);
      cartRef.current = parsed.filter((item) => !item.isGift);
      applyGiftPromotions(cartRef.current);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const areOptionsEqual = (a: CartOption[], b: CartOption[]) =>
    JSON.stringify(a) === JSON.stringify(b);

  const updateCart = (updater: (prev: CartProduct[]) => CartProduct[]) => {
    const updated = updater(cartRef.current);
    cartRef.current = updated;
    applyGiftPromotions(updated);
  };

  const addToCart = (product: CartProduct) => {
    updateCart((prev) => {
      const exists = prev.find(
        (item) =>
          item.variantId === product.variantId &&
          areOptionsEqual(item.options, product.options)
      );

      if (exists) {
        return prev.map((item) =>
          item.variantId === product.variantId &&
          areOptionsEqual(item.options, product.options)
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      } else {
        return [...prev, product];
      }
    });
  };

  const removeFromCart = (variantId: number, options: CartOption[]) => {
    updateCart((prev) =>
      prev.filter(
        (item) =>
          item.variantId !== variantId ||
          !areOptionsEqual(item.options, options)
      )
    );
  };

  const increaseQuantity = (variantId: number, options: CartOption[]) => {
    updateCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId && areOptionsEqual(item.options, options)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (variantId: number, options: CartOption[]) => {
    updateCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId && areOptionsEqual(item.options, options)
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
    );
  };

 const applyGiftPromotions = async (userCart: CartProduct[]) => {
  try {
    const promotions = await fetchPromotions();
    let updatedCart = [...userCart].filter((item) => !item.isGift); 

    const newGifts: CartProduct[] = [];

    for (const item of updatedCart) {
      const promo = promotions[`variant_${item.variantId}`];

      if (
        promo &&
        promo.conditions?.type === "buy_get" &&
        item.quantity >= promo.conditions.buyQuantity
      ) {
        const giftVariantId = promo.conditions.giftProductVariantId;
        const giftQuantity =
          Math.floor(item.quantity / promo.conditions.buyQuantity) *
          promo.conditions.getQuantity;

        const giftData = await fetchVariantById(giftVariantId);

        newGifts.push({
          variantId: giftData.variantId,
          quantity: giftQuantity,
          price: 0,
          name: `🎁 ${giftData.name}`,
          id: giftData.variantId,
          productId: giftData.productId,
          originalPrice: giftData.originalPrice,
          final_price_discount: 0,
          sale_price: null,
          promotion: null,
          options: [],
          isGift: true,
          image: giftData.image?.trim() || "/images/default-gift.jpg",
          discount: 0
        });
      }
    }

    const fullCart = [...updatedCart, ...newGifts];
    setCart(fullCart);
  } catch (error) {
    console.error("Lỗi khi áp dụng quà tặng:", error);
  }
};


  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
