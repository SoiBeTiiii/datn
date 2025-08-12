"use client";

import styles from "../css/CartItem.module.css";
import { CartProduct } from "../context/CartConText";
import { useCart } from "../context/CartConText";
import { MdDelete } from "react-icons/md";
import { formatCurrency } from "../utils/formatCurrency";

export default function CartItem({ product }: { product: CartProduct }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  const isGift = product.isGift;

  const displayPrice = isGift
    ? 0
    : product.sale_price != null
    ? product.sale_price
    : product.final_price_discount != null
    ? product.final_price_discount
    : product.price;

  return (
    <div className={styles.item}>
      <img src={product.image} alt={product.name} className={styles.image} />

      <div className={styles.details}>
        <p className={styles.name}>
          {product.name}
          {isGift && <span className={styles.giftLabel}> 🎁 Được tặng</span>}
        </p>

        {/* ✅ Hiển thị tùy chọn (màu sắc, dung tích...) */}
        {product.options && Object.keys(product.options).length > 0 && (
          <div className={styles.variant}>
            {Object.entries(product.options).map(([key, opt]) => (
              <p key={key}>
                {opt.name}: <strong>{opt.value}</strong>
              </p>
            ))}
          </div>
        )}

        {/* ✅ Hiển thị giá */}
        <p className={styles.price}>
          {isGift ? "0₫" : formatCurrency(displayPrice)}
        </p>

        {/* ✅ Điều chỉnh số lượng nếu không phải quà */}
        {!isGift && (
          <div className={styles.quantityWrapper}>
            <span className={styles.option}>Số lượng:</span>
            <div className={styles.quantity}>
              <button
                onClick={() =>
                  decreaseQuantity(product.variantId, product.options)
                }
                className={styles.btn}
              >
                -
              </button>
              <input type="text" value={product.quantity} readOnly />
              <button
                onClick={() =>
                  increaseQuantity(product.variantId, product.options)
                }
                className={styles.btn}
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* ✅ Nút xoá nếu không phải quà */}
        {!isGift && (
          <button
            onClick={() =>
              removeFromCart(product.variantId, product.options)
            }
            className={styles.deleteBtn}
          >
            <MdDelete size={20} />
            <span>Xoá</span>
          </button>
        )}
      </div>
    </div>
  );
}
