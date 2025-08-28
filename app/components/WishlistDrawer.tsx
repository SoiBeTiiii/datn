"use client";

import styles from "../css/WishlistDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { getWishlists, WishlistItem } from '../../lib/wishlistApi';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

import {
  wishlistCache,
  seedFromLS,
  saveToLS,
  removeFromCache,
  rebuildSetFromList,
} from "../../lib/wishlistCache";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  WishlistItems: any[];
  onAddToWishlist: (slug: string) => Promise<void>;
  onRemoveFromWishlist: (slug: string) => Promise<void>;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onRemoveFromWishlist,
  
}: WishlistDrawerProps) {
  const { user } = useAuth();
  const userKey = user?.email || null;

  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  // Khi mở Drawer: seed từ LS + fetch 1 lần nếu cần
  useEffect(() => {
    let cancelled = false;
    if (!isOpen) return;

    if (!userKey) {
      setLoginModalOpen(true);
      setWishlistItems([]);
      return;
    }

    if (wishlistCache.loadedFor !== userKey) {
      seedFromLS(userKey);
    }
    setWishlistItems([...wishlistCache.list]);

    const load = async () => {
      // có cache hợp lệ thì thôi
      if (wishlistCache.loadedFor === userKey && wishlistCache.list.length > 0) return;

      const resp = await getWishlists();
      const items: WishlistItem[] =
        Array.isArray((resp as any)?.data) ? (resp as any).data :
        Array.isArray((resp as any)?.data?.data) ? (resp as any).data.data :
        Array.isArray(resp) ? (resp as any) : [];

      wishlistCache.list = items;
      rebuildSetFromList();
      wishlistCache.loadedFor = userKey;
      saveToLS(userKey);

      if (!cancelled) setWishlistItems([...wishlistCache.list]);
    };

    load().catch((error: any) => {
      if (error?.response?.status === 401) {
        toast.info("Vui lòng đăng nhập để sử dụng wishlist 🔐");
        setLoginModalOpen(true);
      } else {
        console.error("Wishlist fetch error:", error);
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
      }
    });

    return () => { cancelled = true; };
  }, [isOpen, userKey]);

  const handleRemoveFromWishlist = async (slug: string) => {
    try {
      await onRemoveFromWishlist(slug);

      // lấy item vừa xoá để lấy id (nếu có)
      const removed = wishlistCache.list.find(
        (it: any) => it?.slug === slug || it?.product?.slug === slug
      );
      const id = removed?.id ?? removed?.product_id ?? removed?.product?.id;

      // xoá cả slug & id trong cache + lưu LS + phát event
      removeFromCache(userKey, slug, id);

      // sync UI Drawer
      setWishlistItems([...wishlistCache.list]);
      toast.success("Đã xóa khỏi danh sách yêu thích 💔");
    } catch (error: any) {
      if (error?.response?.status === 401) {
        toast.info("Vui lòng đăng nhập để sử dụng wishlist 🔐");
        setLoginModalOpen(true);
      } else {
        console.error("Lỗi xóa khỏi wishlist:", error);
        toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
      }
    }
  };

  return (
    <>
      <div className={`${styles.overlay} ${isOpen ? styles.open : ""}`}>
        <div className={styles.backdrop} onClick={onClose} />
        <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
          <div className={styles.header}>
            <h3>Đã thích</h3>
            <button onClick={onClose} className={styles.closeBtn} aria-label="Đóng">
              <MdClose size={24} />
            </button>
          </div>

          <div className={styles.content}>
            {Array.isArray(wishlistItems) && wishlistItems.length > 0 ? (
              wishlistItems.map((item) => {
                const basePrice =
                  item?.variants?.[0]?.sale_price ??
                  item?.variants?.[0]?.price ??
                  0;

                const lowestSalePrice = (item?.variants || []).reduce((min: number, v: any) => {
                  const val = v?.sale_price ?? v?.price ?? min;
                  return typeof val === "number" && val < min ? val : min;
                }, typeof basePrice === "number" ? basePrice : 0);

                return (
                  <div key={item.slug} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.image} />
                    <div>
                      <p className={styles.name}>{item.name}</p>
                      <div className={styles.price}>
                        {lowestSalePrice > 0 && (
                          <span className={styles.salePrice}>
                            {lowestSalePrice.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                        {item?.variants?.[0]?.price && (
                          <span className={styles.originalPrice}>
                            {item.variants[0].price.toLocaleString("vi-VN")}₫
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveFromWishlist(item.slug)}
                      aria-label="Xóa khỏi wishlist"
                      title="Xóa khỏi yêu thích"
                    >
                      <MdDelete size={20} />
                    </button>
                  </div>
                );
              })
            ) : (
              <p>Chưa có sản phẩm nào trong wishlist.</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal đăng nhập nếu chưa đăng nhập */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-80 relative">
            <button
              className="absolute top-2 right-3 text-xl"
              aria-label="Đóng"
              onClick={() => setLoginModalOpen(false)}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Vui lòng đăng nhập</h2>
            <p className="mb-4 text-sm text-gray-600">
              Bạn cần đăng nhập để sử dụng wishlist.
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                setLoginModalOpen(false);
                // router.push("/login") nếu muốn
              }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </>
  );
}
