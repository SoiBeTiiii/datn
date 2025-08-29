"use client";

import styles from "./Cart.module.css";
import CartItem from "../components/CartItem";
import { useEffect, useRef, useState } from "react";
import { useCart } from "../context/CartConText";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import { toast } from "react-toastify";
import BackToHomeButton from "../components/BackToHomeButton";
/** Helper đọc giỏ hàng từ localStorage (an toàn JSON) */
function getStorageCartCount(key = "egomall_cart"): number {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.length;
  } catch {
    return 0;
  }
}

export default function CartPage() {
  const router = useRouter();

  // Lấy context giỏ hàng 1 lần
  const { cart, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  const [note, setNote] = useState("");
  const [invoice, setInvoice] = useState(false);

  // Số lượng item trong localStorage (để validate theo yêu cầu)
  const [storageCount, setStorageCount] = useState<number>(0);

  // toast guard để không báo lặp
  const emptyToastShownRef = useRef(false);

  // Đồng bộ storageCount khi mount và khi giỏ hàng trong context thay đổi
  useEffect(() => {
    setStorageCount(getStorageCartCount("egomall_cart"));
  }, [cart]);

  // Nếu giỏ trống → báo 1 lần
  useEffect(() => {
    const isEmpty = storageCount === 0;
    if (isEmpty && !emptyToastShownRef.current) {
      emptyToastShownRef.current = true;
    
    }
    if (!isEmpty) {
      // reset cờ khi có hàng trở lại
      emptyToastShownRef.current = false;
    }
  }, [storageCount]);

  // Lắng nghe thay đổi localStorage từ tab khác
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "egomall_cart") {
        setStorageCount(getStorageCartCount("egomall_cart"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const products = cart.filter((item) => !item.isGift);
  const gifts = cart.filter((item) => item.isGift);

  const handleCheckout = () => {
    // Validate theo yêu cầu: nếu localStorage('egomall_cart') rỗng -> chặn và thông báo
    const count = getStorageCartCount("egomall_cart");
    if (count === 0) {
     
      return;
    }

    localStorage.setItem("checkout_note", note);
    localStorage.setItem("checkout_invoice", JSON.stringify(invoice));
    router.push("/checkout");
  };

  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const originalTotal = products.reduce(
    (sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity,
    0
  );
  const discount = originalTotal - subtotal;
  const total = subtotal;

  // Disable nút nếu giỏ hàng rỗng theo localStorage HOẶC theo context hiện tại
  const isCartEmpty = storageCount === 0 || products.length === 0;

  return (
    <>
      {/* Nút quay về trang chủ (fixed, góc trái) - nếu muốn dùng:
      <button
        className={styles.backBtn}
        onClick={() => router.push("/")}
        aria-label="Quay về trang chủ"
        title="Trang chủ"
      >
        <MdArrowBack size={20} />
        <span>Trang chủ</span>
      </button>
      */}
      <BackToHomeButton />
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.titlebox}>
            <h2>Giỏ hàng:</h2>
            <hr className={styles.divider} />

            {products.length === 0 ? (
              <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
              <>
                {products.map((item, index) => (
                  <CartItem
                    key={`product-${item.variantId}-${index}`}
                    product={item}
                  />
                ))}

                {gifts.length > 0 && (
                  <>
                    <h4 className={styles.giftTitle}>🎁 Quà tặng kèm:</h4>
                    {gifts.map((gift, index) => (
                      <CartItem
                        key={`gift-${gift.variantId}-${index}`}
                        product={gift}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className={styles.right}>
          <h3>Thông tin đơn hàng</h3>

          <div className={styles.summary}>
            <div>
              <span>Tạm tính:</span>
              <strong>{subtotal.toLocaleString()}₫</strong>
            </div>

            <div>
              <span>Giảm giá:</span>
              <strong>
                {discount > 0 ? `- ${discount.toLocaleString()}₫` : "0₫"}
              </strong>
            </div>

            <div>
              <span>Tổng cộng:</span>
              <strong className={styles.total}>{total.toLocaleString()}₫</strong>
            </div>
          </div>

          <button
            className={styles.checkout}
            onClick={handleCheckout}
            disabled={isCartEmpty}
            title={isCartEmpty ? "Giỏ hàng của bạn đang trống" : undefined}
          >
            THANH TOÁN NGAY
          </button>

          {/* Thông báo inline dưới nút khi rỗng */}
          {isCartEmpty && (
            <p className={styles.cartEmptyNote} role="alert">
              🛒 Giỏ hàng của bạn đang trống
            </p>
          )}

          <div
            className={styles.back}
            onClick={() => router.push("/products")}
          >
            ↩ Tiếp tục mua hàng
          </div>
        </div>
      </div>
    </>
  );
}
