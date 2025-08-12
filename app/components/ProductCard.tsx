"use client";

import { FaShoppingCart, FaHeart } from "react-icons/fa"; // Import icon trái tim
import styles from "../css/ProductCard.module.css";
import ProductCardProps from "../interface/ProductCardProps";
import Link from "next/link";
import { useCart } from "../context/CartConText";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToWishlist } from "../../lib/wishlistApi"; // Import hàm API để thêm vào wishlist

export default function ProductCard({
  id,
  name,
  slug,
  image,
  brand,
  price,
  originalPrice,
  discount,
  sold = 0,
  average_rating = 0,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      image: image || '',
      price: price || 0,
      originalPrice: originalPrice || 0,
      quantity: 1,
      final_price_discount: discount ? price || 0 : price || 0,
      sale_price: price || 0,
      productId: id,
      variantId: 0,
      options: [],
      discount: 0
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleAddToWishlist = async () => {
    try {
      await addToWishlist(slug); // Gọi hàm API để thêm vào wishlist
      alert("Sản phẩm đã được thêm vào wishlist!"); // Thông báo khi thêm thành công
    } catch (error) {
      console.error("Lỗi khi thêm vào wishlist:", error);
      alert("Đã có lỗi xảy ra khi thêm vào wishlist.");
    }
  };

  const formatPrice = (value: number | null | undefined) =>
    value ? value.toLocaleString("vi-VN") + "₫" : "";

  return (
    <Link href={`/products/${slug}`} className={styles.card}>
      {discount && discount > 0 && (
        <span className={styles.discount}>-{discount}%</span>
      )}

      <Image
        src={image}
        alt={name}
        className={styles.image}
        width={300}
        height={300}
      />

      <p className={styles.brand}>{brand}</p>
      <h3 className={styles.name}>{name}</h3>

      <p className={styles.price}>
        {formatPrice(price)}{" "}
        {originalPrice && originalPrice > price && (
          <span className={styles.original}>{formatPrice(originalPrice)}</span>
        )}
      </p>

      <div className={styles.stars}>
        {"★".repeat(Math.round(average_rating)) +
          "☆".repeat(5 - Math.round(average_rating))}{" "}
        <span>({average_rating.toFixed(1)} đánh giá)</span>
      </div>

      <div className={styles.progress}>
        <div className={styles.bar} style={{ width: `${sold}%` }}></div>
      </div>
      <p className={styles.sold}>{sold} sản phẩm đã bán</p>

      <div className={styles.actions}>
        <button
          className={styles.buy}
          onClick={(e) => {
            e.preventDefault();
            handleBuyNow();
          }}
        >
          MUA NGAY
        </button>
        <button className={styles.cart} onClick={handleAddToCart}>
          <FaShoppingCart />
        </button>

        {/* Icon trái tim để thêm vào wishlist */}
        <button className={styles.wishlist} onClick={handleAddToWishlist}>
          <FaHeart size={20} color="red" />
        </button>
      </div>
    </Link>
  );
}
