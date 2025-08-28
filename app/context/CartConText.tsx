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
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const LOCAL_STORAGE_KEY = "egomall_cart";

/** ===== Helpers for promotions ===== */
type BuyGetPromo = {
  type: "variant" | "product";
  variantId?: number | string;
  productId?: number | string;
  parentProduct?: number | string;
  promotionId?: number | string;
  promotionName?: string;
  endDate?: string;
  conditions?: {
    type: "buy_get";
    buyQuantity: number | string;
    getQuantity: number | string;
    giftType: "variant";
    giftProductVariantId: number | string;
  };
};
const unwrap = (raw: any) => (raw && raw.data !== undefined ? raw.data : raw);
const isActive = (end?: string) => {
  if (!end) return true;
  const t = new Date(end).getTime();
  return Number.isFinite(t) ? Date.now() <= t : true;
};
function normalizePromotions(raw: any): Map<number, BuyGetPromo> {
  // unwrap { data: ... } if needed
  const data = raw && raw.data !== undefined ? raw.data : raw;
  const map = new Map<number, BuyGetPromo>();
  if (!data) return map;

  // Case 1: object { "variant_30": {...}, "variant_12": {...} }
  if (!Array.isArray(data) && typeof data === "object") {
    Object.entries(data).forEach(([key, val]) => {
      const v = val as any;
      const fromKey = key.startsWith("variant_")
        ? Number(key.split("_")[1])
        : NaN;
      const vid = Number(v?.variantId) || fromKey;
      if (Number.isFinite(vid)) map.set(vid, v as BuyGetPromo);
    });
    return map;
  }

  // Case 2: array
  if (Array.isArray(data)) {
    data.forEach((v: any) => {
      const vid = Number(v?.variantId);
      if (Number.isFinite(vid)) map.set(vid, v as BuyGetPromo);
    });
  }

  return map;
}

function promoActive(endDate?: string): boolean {
  if (!endDate) return true;
  const t = new Date(endDate).getTime();
  return Number.isFinite(t) ? Date.now() <= t : true;
}

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartProduct[]>([]);
  /** cartRef chỉ chứa HÀNG THẬT (không chứa quà) */
  const cartRef = useRef<CartProduct[]>([]);
  /** chống race condition giữa các lần applyGiftPromotions */
  const promoRunIdRef = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const parsed: CartProduct[] = JSON.parse(stored);
      cartRef.current = parsed.filter((item) => !item.isGift);
      // áp quà dựa trên hàng thật đã lưu
      applyGiftPromotions(cartRef.current);
      // set tạm để user thấy ngay; lát nữa applyGiftPromotions sẽ setCart(full) lại
      setCart(parsed);
    }
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const clearCart = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setCart([]);
    cartRef.current = [];
  };

  const areOptionsEqual = (a: CartOption[], b: CartOption[]) =>
    JSON.stringify(a) === JSON.stringify(b);

  /** Cập nhật HÀNG THẬT, rồi tính lại quà */
  const updateCart = (updater: (prev: CartProduct[]) => CartProduct[]) => {
    const updated = updater(cartRef.current);
    cartRef.current = updated; // giữ riêng hàng thật
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
      }
      return [...prev, product];
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

  /** ===== Áp khuyến mãi quà tặng (mua X tặng Y) ===== */
  const applyGiftPromotions = async (userCart: CartProduct[]) => {
    try {
      const promotionsRaw = await fetchPromotions();
      const promos = unwrap(promotionsRaw) as
        | Record<string, BuyGetPromo>
        | BuyGetPromo[];

      // Xây 2 map tra cứu O(1)
      const variantMap = new Map<number, BuyGetPromo>(); // variantId -> promo (type=variant)
      const productMap = new Map<number, BuyGetPromo>(); // productId -> promo (type=product)

      if (Array.isArray(promos)) {
        // Nếu API trả array
        for (const p of promos) {
          if (p?.type === "variant") {
            const vid = Number(p.variantId);
            if (Number.isFinite(vid)) variantMap.set(vid, p);
          } else if (p?.type === "product") {
            const pid = Number(p.productId ?? p.parentProduct);
            if (Number.isFinite(pid)) productMap.set(pid, p);
          }
        }
      } else if (promos && typeof promos === "object") {
        // Nếu API trả object { variant_30: {...}, product_70: {...} ... }
        for (const [key, p0] of Object.entries(promos)) {
          const p = p0 as BuyGetPromo;
          if (p?.type === "variant") {
            const vid =
              Number(p.variantId) ||
              (key.startsWith("variant_") ? Number(key.split("_")[1]) : NaN);
            if (Number.isFinite(vid)) variantMap.set(vid, p);
          } else if (p?.type === "product") {
            const pid =
              Number(p.productId ?? p.parentProduct) ||
              (key.startsWith("product_") ? Number(key.split("_")[1]) : NaN);
            if (Number.isFinite(pid)) productMap.set(pid, p);
          }
        }
      }

      // Bỏ quà cũ, chỉ tính từ hàng thật
      const baseCart = [...userCart].filter((i) => !i.isGift);

      // Gom số lượng quà theo giftVariantId
      const giftQtyByVariant = new Map<number, number>();

      for (const item of baseCart) {
        // Ưu tiên promo theo variant, nếu không có thì dùng promo theo productId
        const promo =
          variantMap.get(Number(item.variantId)) ||
          productMap.get(Number(item.productId));

        if (!promo) continue;
        if (promo.conditions?.type !== "buy_get") continue;
        if (!isActive(promo.endDate)) continue;

        const buyQ = Number(promo.conditions.buyQuantity) || 0;
        const getQ = Number(promo.conditions.getQuantity) || 0;
        const qty = Number(item.quantity) || 0;
        if (buyQ <= 0 || getQ <= 0 || qty < buyQ) continue;

        const times = Math.floor(qty / buyQ);
        const giftQty = times * getQ;
        if (giftQty <= 0) continue;

        const giftVariantId = Number(promo.conditions.giftProductVariantId);
        if (!Number.isFinite(giftVariantId)) continue;

        giftQtyByVariant.set(
          giftVariantId,
          (giftQtyByVariant.get(giftVariantId) || 0) + giftQty
        );
      }

      // Không có quà → trả lại hàng thật
      if (giftQtyByVariant.size === 0) {
        setCart(baseCart);
        return;
      }

      // Lấy thông tin các gift variant song song
      const giftVariantIds = Array.from(giftQtyByVariant.keys());
      const giftDetails = await Promise.all(
        giftVariantIds.map(async (gvid) => {
          try {
            const d = await fetchVariantById(gvid);
            return { gvid, d };
          } catch {
            return { gvid, d: null as any };
          }
        })
      );

      const giftItems: CartProduct[] = [];
      for (const { gvid, d } of giftDetails) {
        if (!d) continue;
        const q = giftQtyByVariant.get(gvid) || 0;
        if (q <= 0) continue;

        giftItems.push({
          variantId: d.variantId,
          quantity: q,
          price: 0,
          name: `🎁 ${d.name}`,
          id: d.variantId,
          productId: d.productId,
          originalPrice: d.originalPrice,
          final_price_discount: 0,
          sale_price: null,
          promotion: null,
          options: [],
          isGift: true,
          image:
            (d.image && String(d.image).trim()) || "/images/default-gift.jpg",
          discount: 0,
        });
      }

      setCart([...baseCart, ...giftItems]);
    } catch (error) {
      console.error("Lỗi khi áp dụng quà tặng:", error);
      // fallback: vẫn hiển thị hàng thật
      setCart(userCart.filter((i) => !i.isGift));
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
        clearCart,
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
