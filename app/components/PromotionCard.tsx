"use client";

import { FaShoppingCart, FaHeart } from "react-icons/fa";
import styles from "../css/PromotionCard.module.css";
import ProductCardProps from "../interface/PromotionCard";
import Link from "next/link";
import { slugify } from "../utils/slug";
import { useCart } from "../context/CartConText";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { addToWishlist } from "../../lib/wishlistApi";
import { FaStar, FaRegStar } from "react-icons/fa";

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

  const finalPrice = final_price_discount ?? price;
  const slug = slugify(name ?? "");

  const handleAddToCart = () => {
    addToCart({
      id,
      name: name ?? "",
      image: image ?? "",
      price: finalPrice ?? 0,
      originalPrice: originalPrice ?? 0,
      discount: discount ?? 0,
      quantity: 1,
      final_price_discount: undefined,
      sale_price: null,
      productId: id,
      variantId: 0,
      options: [],
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleAddToWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!user) {
      toast.info("Vui lòng đăng nhập để thêm vào wishlist 🔐");
      setLoginModalOpen(true);
      return;
    }

    try {
      await addToWishlist(slug);
      toast.success("Đã thêm vào danh sách yêu thích 💖");
    } catch (error: any) {
      const message = error?.response?.data?.message?.toLowerCase() ?? "";
      if (
        message.includes("danh sách yêu thích") ||
        message.includes("tồn tại")
      ) {
        toast.warning("Sản phẩm đã có trong wishlist 🧐");
      } else {
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
      }
    }
  };

  return (
    <div>
      <div className={styles.card}>
        <Link href={`/products/${slug}`}>
          {promotionLabel && (
            <div className={styles.promoTag}>{promotionLabel}</div>
          )}
          <img src={image} alt={name} className={styles.image} />
          <p className={styles.brand}>WHOO</p>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.price}>
            {(finalPrice ?? 0).toLocaleString()}₫{" "}
            {originalPrice && (
              <span className={styles.original}>
                {(originalPrice ?? 0).toLocaleString()}₫
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
              style={{ width: `${sold ?? 0}%` }}
            ></div>
          </div>
          <p className={styles.sold}>{sold ?? 0} sản phẩm đã bán</p>
        </Link>

        <div className={styles.actions}>
          {/* <button className={styles.buy} onClick={handleBuyNow}>
            MUA NGAY
          </button>
          <button className={styles.cart} onClick={handleAddToCart}>
            <FaShoppingCart />
          </button> */}
          <button className={styles.wishlist} onClick={handleAddToWishlist}>
            <FaHeart size={20} color="red" />
          </button>
        </div>
      </div>

      {isLoginModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
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
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
