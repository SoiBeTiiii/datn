"use client";

import { MdClose } from "react-icons/md";
import styles from "../css/MobileMenu.module.css";
import { useState } from "react";

export default function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.menuDrawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <span className={styles.logo}>EGOMall</span>
          <MdClose size={24} className={styles.closeIcon} onClick={onClose} />
        </div>

        <div className={styles.menuItem} onClick={() => toggle("trangdiem")}>
          Trang điểm
        </div>
        {openMenu === "trangdiem" && (
          <div className={styles.subMenu}>
            <h4>TRANG ĐIỂM MẶT</h4>
            <span>Kem Nền</span>
            <span>Kem Lót</span>
            <span>Che Khuyết Điểm</span>
            <span>Phấn Má Hồng</span>
            <span>Phấn Nước Cushion</span>
            <span>Phấn Phủ</span>
            <span>Tạo Khối</span>
            <span>Kem nền BB / CC</span>

            <h4>TRANG ĐIỂM MÔI</h4>
            <span>Son Thỏi</span>
            <span>Son Tint | Son Kem</span>
            <span>Son Bóng</span>
            <span>Son Dưỡng Môi</span>
          </div>
        )}
        <div className={styles.menuItem}>Thương hiệu</div>
        <div className={styles.menuItem}>Khuyến mãi</div>
        <div className={styles.menuItem}>Sản phẩm mới</div>
      </div>
    </>
  );
}
