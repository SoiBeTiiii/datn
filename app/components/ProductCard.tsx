"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import {
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaStar,
  FaRegStar,
} from "react-icons/fa";

import styles from "../css/ProductCard.module.css";
import ProductCardProps from "../interface/ProductCardProps";
import { useCart } from "../context/CartConText";
import { useAuth } from "../context/AuthContext";

// API wishlist
import {
  addToWishlist,
  getWishlists,
  removeFromWishlist,
} from "../../lib/wishlistApi";

// Portal cho login modal
import Portal from "../components/Portal";

// Cache chung + event bus
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

export default function ProductCard({
  id,
  name,
  slug,
  image,
  brand,
  price,
  originalPrice,
  discount,
  sold_count,
  average_rating = 0,
  type_skin,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [checkingWish, setCheckingWish] = useState(false);
  const [isWished, setIsWished] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const userKey = user?.email ?? null;

  // khoá scroll khi mở modal
  useEffect(() => {
    if (isLoginModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLoginModalOpen]);

  // Seed từ localStorage + fetch 1 lần wishlist cho user hiện tại (nếu cần)
  useEffect(() => {
    let cancelled = false;

    if (user === null) {
      // chắc chắn chưa login
      setIsWished(false);
      setSeeded(true);
      return;
    }

    // 1) seed từ localStorage theo email → tránh flash xám
    if (userKey && wishlistCache.loadedFor !== userKey) {
      seedFromLS(userKey);
    }
    setIsWished(hasInCache(slug, id));
    setSeeded(true);

    // 2) fetch 1 lần nếu chưa có cache cho user hiện tại
    const load = async () => {
      if (!userKey) return;

      if (
        wishlistCache.loadedFor === userKey &&
        wishlistCache.list.length > 0
      ) {
        return; // đã có cache hợp lệ
      }

      if (wishlistCache.loading) {
        await wishlistCache.loading;
        if (!cancelled) setIsWished(hasInCache(slug, id));
        return;
      }

      wishlistCache.loading = (async () => {
        const resp = await getWishlists();
        const items: any[] = Array.isArray((resp as any)?.data)
          ? (resp as any).data
          : Array.isArray((resp as any)?.data?.data)
          ? (resp as any).data.data
          : Array.isArray(resp)
          ? (resp as any)
          : [];
        wishlistCache.list = items;
        rebuildSetFromList();
        wishlistCache.loadedFor = userKey;
        wishlistCache.loading = null;
        saveToLS(userKey);
      })();

      await wishlistCache.loading;
      if (!cancelled) setIsWished(hasInCache(slug, id));
    };

    load().catch(() => {
      /* ignore */
    });

    return () => {
      cancelled = true;
    };
  }, [userKey, user, id, slug]);

  // Lắng nghe event để sync với Drawer/PromotionCard
  useEffect(() => {
    const handler = () => setIsWished(hasInCache(slug, id));
    window.addEventListener(WISHLIST_EVENT, handler as EventListener);
    return () =>
      window.removeEventListener(WISHLIST_EVENT, handler as EventListener);
  }, [slug, id]);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      image: image || "",
      price: price || 0,
      originalPrice: originalPrice || 0,
      quantity: 1,
      final_price_discount: discount ? price || 0 : price || 0,
      sale_price: price || 0,
      productId: id,
      variantId: 0,
      options: [],
      discount: 0,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  // toggle wishlist (cập nhật cache + phát event)
  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (checkingWish || isMutating) return;

    if (!userKey) {
      toast.info("Vui lòng đăng nhập để thêm vào wishlist 🔐");
      setLoginModalOpen(true);
      return;
    }

    try {
      setIsMutating(true);
      if (!isWished) {
        await addToWishlist(slug);
        setIsWished(true);
        addToCache(userKey, slug, id); // cập nhật cache + event
        toast.success("Đã thêm vào danh sách yêu thích 💖");
      } else {
        await removeFromWishlist(slug); // hoặc id nếu API yêu cầu
        setIsWished(false);
        removeFromCache(userKey, slug, id); // cập nhật cache + event
        toast.info("Đã xoá khỏi danh sách yêu thích 💔");
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message?.toLowerCase() ?? "";
      if (msg.includes("danh sách yêu thích") || msg.includes("đã có")) {
        setIsWished(true);
        addToCache(userKey, slug, id);
        toast.warning("Sản phẩm đã có trong wishlist 🧐");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
      }
    } finally {
      setIsMutating(false);
    }
  };

  const formatPrice = (value: number | null | undefined) =>
    value ? value.toLocaleString("vi-VN") + "₫" : "";

  return (
    <div>
      <section className={styles.card}>
        {discount && discount > 0 && (
          <span className={styles.discount}>-{discount}%</span>
        )}

        <Link href={`/products/${slug}`}>
          <Image
            src={image}
            alt={name}
            className={styles.image}
            width={300}
            height={300}
          />
        </Link>

        <p className={styles.brand}>{brand}</p>
        <Link href={`/products/${slug}`}>
          <h3 className={styles.name}>{name}</h3>
        </Link>

        <p className={styles.price}>
          {formatPrice(price)}{" "}
          {originalPrice && originalPrice > (price ?? 0) && (
            <span className={styles.original}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </p>

        <div className={styles.stars}>
          {[...Array(5)].map((_, i) =>
            i < Math.round(average_rating) ? (
              <FaStar key={i} color="#FFD700" />
            ) : (
              <FaRegStar key={i} color="#ccc" />
            )
          )}
          <span>({average_rating.toFixed(1)} đánh giá)</span>
        </div>

        <div className={styles.progress}>
          <div
            className={styles.bar}
            style={{ width: `${Math.min(Number(sold_count) || 0, 100)}%` }}
          />
        </div>
        <p className={styles.sold}>{sold_count} sản phẩm đã bán</p>

        <div className={styles.actions}>
          {/* <button className={styles.buy} onClick={handleBuyNow}>MUA NGAY</button>
          <button className={styles.cart} onClick={handleAddToCart}>
            <FaShoppingCart />
          </button> */}

          <button
            className={`${styles.wishlist} ${
              isWished ? styles.wishlistActive : ""
            }`}
            onClick={handleToggleWishlist}
            aria-label={isWished ? "Bỏ khỏi wishlist" : "Thêm vào wishlist"}
            disabled={checkingWish || isMutating || !seeded}
            title={isWished ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
          >
            {isWished ? (
              <FaHeart size={20} color="red" />
            ) : (
              <FaRegHeart size={20} />
            )}
          </button>
        </div>
      </section>

      {/* Login Modal via Portal */}
      {isLoginModalOpen && (
        <Portal>
          <div
            className={styles.overlay}
            onClick={() => setLoginModalOpen(false)}
          >
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
