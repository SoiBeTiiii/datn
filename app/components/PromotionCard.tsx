"use client";
import { FaShoppingCart } from "react-icons/fa";
import styles from "../css/PromotionCard.module.css";
import ProductCardProps from "../interface/PromotionCard";
import Link from "next/link";
import { slugify } from "../utils/slug";
import { useCart } from "../context/CartConText";

export default function PromotionCard({
  id,
  name,
  price,
  originalPrice,
  image,
  sold,
  rating,
  discount,
  final_price_discount,
  promotionLabel,
}: ProductCardProps & { promotionName?: string }) {
  const { addToCart } = useCart();
  const finalPrice = final_price_discount ?? price;

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
      productId: 0,
      variantId: 0,
      options: []
    });
  };

  const slug = slugify(name ?? "");

  return (
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
        ☆☆☆☆☆ <span>(0 đánh giá)</span>
      </div>

      <div className={styles.progress}>
        <div className={styles.bar} style={{ width: `${sold ?? 0}%` }}></div>
      </div>
      <p className={styles.sold}>{sold ?? 0} sản phẩm đã bán</p>

      <div className={styles.actions}>
          <button className={styles.buy}>MUA NGAY</button>

          <button className={styles.cart}>
            <FaShoppingCart />
          </button>
     
      </div>
         </Link>
    </div>
  );
}
