"use client";

import styles from "../css/WishlistDrawer.module.css";
import { MdClose, MdDelete } from "react-icons/md";
import { useState, useEffect } from "react";
import { getWishlists, WishlistItem } from "../../lib/wishlistApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistItems: any[];
  onAddToWishlist: (slug: string) => Promise<void>;
  onRemoveFromWishlist: (slug: string) => Promise<void>;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onRemoveFromWishlist,
}: WishlistDrawerProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const isUserLoggedIn = () => {
    // Kiểm tra token trong cookie
    const token = Cookies.get("authToken"); // Giả sử tên cookie là "authToken"
    return token !== undefined;
  };
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        // Nếu người dùng chưa đăng nhập, không gọi API mà chỉ hiển thị modal đăng nhập
        if (!isUserLoggedIn()) {
          setLoginModalOpen(true); // Hiển thị modal yêu cầu đăng nhập
          return; // Dừng lại ở đây mà không gửi yêu cầu API
        }

        // Gửi yêu cầu API nếu đã đăng nhập
        const wishlistData = await getWishlists();
        setWishlistItems(wishlistData.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          // Nếu nhận lỗi 401 (chưa đăng nhập), chỉ hiển thị thông báo mà không làm gián đoạn
          console.log(
            "Token không hợp lệ hoặc chưa đăng nhập, yêu cầu đăng nhập."
          );
          // Optional: Bạn có thể thêm toast thông báo nếu cần
          toast.info("Vui lòng đăng nhập để sử dụng wishlist 🔐");
          setLoginModalOpen(true); // Hiển thị modal đăng nhập
        } else {
          // Nếu có lỗi khác, hiển thị thông báo lỗi chung
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
      const { data } = await getWishlists();
      setWishlistItems(data);
      toast.success("Đã xóa khỏi danh sách yêu thích 💔");
    } catch (error: any) {
      if (error.response?.status === 401) {
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
            {wishlistItems.length === 0 ? (
              <p>Chưa có sản phẩm nào trong wishlist.</p>
            ) : (
              wishlistItems.map((item) => {
                const lowestSalePrice = item.variants.reduce(
                  (min: number, variant) =>
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
        </div>
      </div>

      {/* ✅ Modal đăng nhập nếu chưa đăng nhập */}
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
                // 👉 Redirect sang trang đăng nhập nếu cần
                // router.push("/login");
              }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
