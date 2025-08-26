"use client";

import styles from "../css/WishlistDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { getWishlists, WishlistItem } from "../../lib/wishlistApi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import Cookies from "js-cookie"; // ❌ không dùng cho httpOnly
// (tùy chọn) nếu bạn có AuthContext:
// import { useAuth } from "../context/AuthContext";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // ⚠️ Bạn đang không dùng 2 props dưới. Giữ lại nếu parent cần, nhưng component render dựa trên state nội bộ.
  wishlistItems?: any[];
  onAddToWishlist?: (slug: string) => Promise<void>;
  onRemoveFromWishlist: (slug: string) => Promise<void>;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onRemoveFromWishlist,
}: WishlistDrawerProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  // const { user } = useAuth(); // nếu có context

  const isUserLoggedIn = () => {
    // ✅ Dùng localStorage đúng với nơi bạn lưu token khi login
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    // hoặc nếu có context: return !!user;
    return !!token;
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (!isUserLoggedIn()) {
          setLoginModalOpen(true);
          return;
        }

        const resp = await getWishlists();
        // ✅ Chuẩn hóa: cố gắng lấy mảng ở các shape phổ biến
        const items =
          Array.isArray((resp as any)?.data) ? (resp as any).data :
          Array.isArray((resp as any)?.data?.data) ? (resp as any).data.data :
          Array.isArray(resp) ? (resp as any) :
          [];

        setWishlistItems(items);
      } catch (error: any) {
        if (error?.response?.status === 401) {
          toast.info("Vui lòng đăng nhập để sử dụng wishlist 🔐");
          setLoginModalOpen(true);
        } else {
          console.error("Wishlist fetch error:", error);
          toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢");
        }
      }
    };

    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  const handleRemoveFromWishlist = async (slug: string) => {
    try {
      await onRemoveFromWishlist(slug);
      // refetch sau khi xóa
      const resp = await getWishlists();
      const items =
        Array.isArray((resp as any)?.data) ? (resp as any).data :
        Array.isArray((resp as any)?.data?.data) ? (resp as any).data.data :
        Array.isArray(resp) ? (resp as any) :
        [];
      setWishlistItems(items);

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
            <button onClick={onClose} className={styles.closeBtn}>
              <MdClose size={24} />
            </button>
          </div>

          <div className={styles.content}>
            {Array.isArray(wishlistItems) && wishlistItems.length > 0 ? (
              wishlistItems.map((item) => {
                // Phòng khi API thiếu variants hoặc mảng rỗng
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
          <div className="bg-white p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Vui lòng đăng nhập</h2>
            <p className="mb-4 text-sm text-gray-600">
              Bạn cần đăng nhập để sử dụng wishlist.
            </p>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => {
                setLoginModalOpen(false);
                // ví dụ: router.push("/login")
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
