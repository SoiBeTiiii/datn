// components/CartDrawer.tsx (hoặc vị trí bạn đang dùng)
"use client";

import styles from "../css/CartDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useCart } from "../context/CartConText";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } =
    useCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ✅ Disable dựa vào context (realtime)
  const checkoutDisabled = cart.length === 0;

  const handleCheckout = () => {
    if (checkoutDisabled) return;

    // 1) Đóng drawer ngay lập tức để bỏ overlay
    onClose?.();

    // 2) Check login sơ bộ bằng token (nếu bạn lưu token ở localStorage)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

    if (!token) {
      const next = encodeURIComponent("/checkout");
      router.push(`/login?next=${next}`);
      return;
    }

    // 3) Đã login -> qua checkout
    router.push("/checkout");
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.header}>
          <h3>Giỏ hàng</h3>
          <button
            onClick={onClose}
            className={styles.closeBtn}
            aria-label="Đóng giỏ hàng"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {cart.length === 0 && (
            <p className={styles.empty}>Giỏ hàng của bạn đang trống.</p>
          )}

          {cart.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}-${Object.values(
                item.options
              ).join("-")}`}
              className={styles.item}
            >
              <img src={item.image} alt={item.name} className={styles.thumb} />
              <div style={{ flex: 1 }}>
                <p className={styles.name}>{item.name}</p>

                {/* Tùy chọn đã chọn */}
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
                    aria-label="Giảm số lượng"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      increaseQuantity(item.variantId, item.options)
                    }
                    aria-label="Tăng số lượng"
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
                aria-label="Xóa sản phẩm khỏi giỏ"
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

          {checkoutDisabled && (
            <p className={styles.warning}>
              Giỏ hàng của bạn chưa đạt mức tối thiểu để thanh toán.
            </p>
          )}
          <button
            className={styles.checkoutBtn}
            onClick={handleCheckout}
            disabled={checkoutDisabled}
            aria-disabled={checkoutDisabled}
            title={checkoutDisabled ? "Giỏ hàng trống" : "Tiến hành thanh toán"}
          >
            THANH TOÁN
          </button>

          <Link className={styles.viewCart} href="/cart" onClick={onClose}>
            Xem giỏ hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
