// app/thank-you/page.tsx
"use client";

import Link from "next/link";
import styles from "./thankYou.module.css";
import { FaCheckCircle } from "react-icons/fa";

export default function ThankYouPage() {
  return (
    <div className={styles.container}>
      <FaCheckCircle className={styles.icon} />
      <h1>Cảm ơn bạn đã đặt hàng!</h1>
      <p>Chúng tôi đã nhận được đơn hàng và sẽ xử lý trong thời gian sớm nhất.</p>
      <Link href="/" className={styles.homeBtn}>
        Quay về trang chủ
      </Link>
    </div>
  );
}
