"use client";

import styles from "./Cart.module.css";
import CartItem from "../components/CartItem";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartConText";
import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";

export default function CartPage() {
  const { cart } = useCart();
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const router = useRouter();
  const [note, setNote] = useState("");
  const [invoice, setInvoice] = useState(false);

  const products = cart.filter((item) => !item.isGift);
  const gifts = cart.filter((item) => item.isGift);

  const handleCheckout = () => {
    localStorage.setItem("checkout_note", note);
    localStorage.setItem("checkout_invoice", JSON.stringify(invoice));
    router.push("/checkout");
  };

  const subtotal = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = products.reduce(
    (sum, item) => sum + (item.originalPrice ?? item.price) * item.quantity,
    0
  );
  const discount = originalTotal - subtotal;
  const total = subtotal;

  return (
    <>
      {/* Nút quay về trang chủ (fixed, góc trái) */}
     

      <div className={styles.container}>
          <button
        className={styles.backBtnPC}
        onClick={() => router.push("/")}
        aria-label="Quay về trang chủ"
      >
        <MdArrowBack size={24} />
      </button>
      <button
        className={styles.backBtn}
        onClick={() => router.push("/")}
        aria-label="Quay về trang chủ"
      >
        <MdArrowBack size={24} />
      </button>   
        <div className={styles.left}>
          <div className={styles.titlebox}>
            <h2>Giỏ hàng:</h2>
            <hr className={styles.divider} />

            {products.length === 0 ? (
              <p>Giỏ hàng của bạn đang trống.</p>
            ) : (
              <>
                {products.map((item, index) => (
                  <CartItem key={`product-${item.variantId}-${index}`} product={item} />
                ))}

                {gifts.length > 0 && (
                  <>
                    <h4 className={styles.giftTitle}>🎁 Quà tặng kèm:</h4>
                    {gifts.map((gift, index) => (
                      <CartItem key={`gift-${gift.variantId}-${index}`} product={gift} />
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
              <strong>{discount > 0 ? `- ${discount.toLocaleString()}₫` : "0₫"}</strong>
            </div>

            <div>
              <span>Tổng cộng:</span>
              <strong className={styles.total}>{total.toLocaleString()}₫</strong>
            </div>
          </div>

          {/* <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={invoice}
              onChange={(e) => setInvoice(e.target.checked)}
            />
            Thông tin xuất hoá đơn
          </label> */}

          <button className={styles.checkout} onClick={handleCheckout}>
            THANH TOÁN NGAY
          </button>

          <div className={styles.back} onClick={() => router.push("/products")}>↩ Tiếp tục mua hàng</div>
        </div>
      </div>
    </>
  );
}
