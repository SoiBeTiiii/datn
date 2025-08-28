"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaHeart, FaRegHeart, FaStar, FaRegStar } from "react-icons/fa";

import styles from "../css/PromotionCard.module.css";
import ProductCardProps from "../interface/PromotionCard";
import { slugify } from "../utils/slug";
import { useCart } from "../context/CartConText";
import { useAuth } from "../context/AuthContext";

import { addToWishlist, getWishlists, removeFromWishlist } from "../../lib/wishlistApi";
import Portal from "./Portal";

// cache chung
import {
  wishlistCache,
  seedFromLS,
  saveToLS,
  hasInCache,
  addToCache,
  removeFromCache,
  WISHLIST_EVENT,
  rebuildSetFromList,
} from "../../lib/wishlistCache";

export default function PromotionCard({
  id,
  name,
  price,
  originalPrice,
  image,
  sold,
  average_rating = 0,
  discount,
  final_price_discount,
  promotionLabel,
}: ProductCardProps & { promotionName?: string }) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [checkingWish, setCheckingWish] = useState(false);
  const [loadingSeed, setLoadingSeed] = useState(true);

  const finalPrice = final_price_discount ?? price;
  const slug = slugify(name ?? "");
  const userKey = user?.email ?? null;

  // seed từ LS + fetch 1 lần cho user hiện tại (nếu cần)
  useEffect(() => {
    let cancelled = false;

    // chưa xác định đăng nhập: đừng ép false
    if (user === null) {
      setIsWished(false);
      setLoadingSeed(false);
      return;
    }

    // seed từ LS theo email
    if (userKey && wishlistCache.loadedFor !== userKey) {
      seedFromLS(userKey);
    }
    setIsWished(hasInCache(slug, id));
    setLoadingSeed(false);

    const loadAPI = async () => {
      if (!userKey) return;

      if (wishlistCache.loadedFor === userKey && wishlistCache.list.length > 0) {
        return; // đã có cache
      }

      if (wishlistCache.loading) {
        await wishlistCache.loading;
        if (!cancelled) setIsWished(hasInCache(slug, id));
        return;
      }

      wishlistCache.loading = (async () => {
        const resp = await getWishlists();
        const items: any[] =
          Array.isArray((resp as any)?.data) ? (resp as any).data :
          Array.isArray((resp as any)?.data?.data) ? (resp as any).data.data :
          Array.isArray(resp) ? (resp as any) : [];
        wishlistCache.list = items;
        rebuildSetFromList();
        wishlistCache.loadedFor = userKey;
        wishlistCache.loading = null;
        saveToLS(userKey);
      })();

      await wishlistCache.loading;
      if (!cancelled) setIsWished(hasInCache(slug, id));
    };

    loadAPI();
    return () => { cancelled = true; };
  }, [userKey, user, slug, id]);

  // nghe event để sync với Drawer
  useEffect(() => {
    const handler = () => setIsWished(hasInCache(slug, id));
    window.addEventListener(WISHLIST_EVENT, handler as EventListener);
    return () => window.removeEventListener(WISHLIST_EVENT, handler as EventListener);
  }, [slug, id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userKey) {
      toast.info("Vui lòng đăng nhập để thêm vào wishlist 🔐");
      setLoginModalOpen(true);
      return;
    }
    try {
      setCheckingWish(true);
      if (!isWished) {
        await addToWishlist(slug);
        setIsWished(true);
        addToCache(userKey, slug, id);      // cập nhật cache + phát event
        toast.success("Đã thêm vào danh sách yêu thích 💖");
      } else {
        await removeFromWishlist(slug);     // hoặc id nếu API cần
        setIsWished(false);
        removeFromCache(userKey, slug, id); // cập nhật cache + phát event
        toast.info("Đã xoá khỏi danh sách yêu thích 💔");
      }
    } catch (err: any) {
      const m = err?.response?.data?.message?.toLowerCase() ?? "";
      if (m.includes("đã có") || m.includes("wishlist")) {
        setIsWished(true);
        addToCache(userKey, slug, id);
        toast.warning("Sản phẩm đã có trong wishlist 🧐");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
      }
    } finally {
      setCheckingWish(false);
    }
  };

  return (
    <div>
      <div className={styles.card}>
        <Link href={`/products/${slug}`}>
          {promotionLabel && <div className={styles.promoTag}>{promotionLabel}</div>}

          <img src={image} alt={name} className={styles.image} />
          <p className={styles.brand}>WHOO</p>

          <h3 className={styles.name}>{name}</h3>

          <p className={styles.price}>
            {(finalPrice ?? 0).toLocaleString()}₫{" "}
            {originalPrice ? (
              <span className={styles.original}>
                {(originalPrice ?? 0).toLocaleString()}₫
              </span>
            ) : null}
          </p>

          <div className={styles.stars}>
            {[...Array(5)].map((_, i) =>
              i < Math.round(average_rating) ? <FaStar key={i} color="#FFD700" /> : <FaRegStar key={i} color="#ccc" />
            )}
            <span>({average_rating.toFixed(1)} đánh giá)</span>
          </div>

          <div className={styles.progress}>
            <div className={styles.bar} style={{ width: `${Math.min(Number(sold) || 0, 100)}%` }} />
          </div>
          <p className={styles.sold}>{sold ?? 0} sản phẩm đã bán</p>
        </Link>

        <div className={styles.actions}>
          <button
            className={`${styles.wishlist} ${isWished ? styles.wishlistActive : ""}`}
            onClick={handleToggleWishlist}
            aria-label={isWished ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
            disabled={checkingWish || loadingSeed}
            title={isWished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            {isWished ? <FaHeart size={20} color="red" /> : <FaRegHeart size={20} />}
          </button>
        </div>
      </div>

      {/* Login Modal via Portal */}
      {isLoginModalOpen && (
        <Portal>
          <div className={styles.overlay} onClick={() => setLoginModalOpen(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <button
                className={styles.closeBtn}
                onClick={() => setLoginModalOpen(false)}
                aria-label="Đóng"
              >
                &times;
              </button>
              <h2 className="text-lg font-semibold mb-4">Vui lòng đăng nhập</h2>
              <p className="mb-4 text-sm text-gray-600">
                Bạn cần đăng nhập để sử dụng wishlist.
              </p>
              <button
                className={styles.button}
                onClick={() => {
                  setLoginModalOpen(false);
                  router.push("/login");
                }}
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
