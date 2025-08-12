"use client";

import styles from "../css/WishlistDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: any[]; // Danh sách sản phẩm yêu thích
  onAddToWishlist: (slug: string) => void;
  onRemoveFromWishlist: (slug: string) => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems,
  onAddToWishlist,
  onRemoveFromWishlist,
}: WishlistDrawerProps) {
  const [isAdding, setIsAdding] = useState(false); // Trạng thái đang thêm

  // Hàm gọi API để thêm sản phẩm vào wishlist
  const handleAddToWishlist = async (slug: string) => {
    setIsAdding(true);
    try {
      await onAddToWishlist(slug); // Gọi hàm từ cha để thêm vào backend
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Hàm gọi API để xóa sản phẩm khỏi wishlist
  const handleRemoveFromWishlist = async (slug: string) => {
    try {
      await onRemoveFromWishlist(slug); // Gọi hàm từ cha để xóa khỏi backend
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  return (
    <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
      {/* Nền mờ có thể click */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Drawer trượt mượt */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.header}>
          <h3>Đã thích</h3>
          <button onClick={onClose} className={styles.closeBtn}>
            <MdClose size={24} />
          </button>
        </div>

        <div className={styles.content}>
          {wishlistItems.length === 0 ? (
            <p>Chưa có sản phẩm nào trong wishlist.</p>
          ) : (
            wishlistItems.map((item) => {
              const lowestSalePrice = item.variants.reduce(
                (min: number, variant: { sale_price?: number; price: number }) =>
                  variant.sale_price && variant.sale_price < min
                    ? variant.sale_price
                    : min,
                item.variants[0].sale_price || item.variants[0].price
              );

              return (
                <div key={item.slug} className={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.image}
                  />
                  <div>
                    <p className={styles.name}>{item.name}</p>
                    <div className={styles.price}>
                      {lowestSalePrice && (
                        <span className={styles.salePrice}>
                          {lowestSalePrice.toLocaleString("vi-VN")}₫
                        </span>
                      )}
                      <span className={styles.originalPrice}>
                        {item.variants[0].price.toLocaleString("vi-VN")}₫
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveFromWishlist(item.slug)}
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className={styles.footer}>
          <button
            onClick={() => handleAddToWishlist("ao-thun-nam")}
            disabled={isAdding}
          >
            {isAdding ? "Đang thêm..." : "Thêm vào Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}
