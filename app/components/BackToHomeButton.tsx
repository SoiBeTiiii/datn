"use client";

import { useRouter } from "next/navigation";
import { MdArrowBack } from "react-icons/md";
import styles from "../css/BackToHomeButton.module.css";

export default function BackToHomeButton() {
  const router = useRouter();

  return (
    <button
      className={styles.backToHome}
      onClick={() => router.push("/")}
      aria-label="Quay về trang chủ"
      title="Trang chủ"
    >
      <MdArrowBack size={20} aria-hidden="true" />
      <span className={styles.backText}>Trang chủ</span>
    </button>
  );
}
