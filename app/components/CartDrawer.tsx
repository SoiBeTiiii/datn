"use client";

import styles from "../css/CartDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useCart } from "../context/CartConText";
import Link from "next/link";
import router from "next/router";
interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.header}>
          <h3>Giỏ hàng</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}-${Object.values(
                item.options
              ).join("-")}`}
              className={styles.item}
            >
              <img src={item.image} alt={item.name} />
              <div style={{ flex: 1 }}>
                <p className={styles.name}>{item.name}</p>

                {/* ✅ Hiển thị các tùy chọn đã chọn */}
                <div className={styles.options}>
                  {Object.entries(item.options).map(([key, opt]) => (
                    <div key={key} className={styles.optionItem}>
                      <span className={styles.optionName}>{opt.name}:</span>{" "}
                      <span className={styles.optionValue}>{opt.value}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.qty}>
                  <button
                    onClick={() =>
                      decreaseQuantity(item.variantId, item.options)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      increaseQuantity(item.variantId, item.options)
                    }
                  >
                    +
                  </button>
                </div>

                <div className={styles.price}>
                  {item.price.toLocaleString()}₫
                </div>
              </div>

              <button
                onClick={() => removeFromCart(item.variantId, item.options)}
                className={styles.deleteBtn}
                title="Xóa sản phẩm"
              >
                <MdDelete size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.total}>
            <span>TỔNG TIỀN:</span>
            <strong>{total.toLocaleString()}₫</strong>
          </div>
          <p className={styles.warning}>
            Giỏ hàng của bạn chưa đạt mức tối thiểu để thanh toán.
          </p>
          <button
            className={styles.checkoutBtn}
            onClick={() => router.push("/checkout")}
          >
            THANH TOÁN
          </button>
          <a className={styles.viewCart} href="/cart">
            Xem giỏ hàng
          </a>
        </div>
      </div>
    </div>
  );
}
