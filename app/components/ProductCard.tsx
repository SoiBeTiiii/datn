"use client";

import { FaShoppingCart, FaHeart } from "react-icons/fa"; // Import icon trái tim
import styles from "../css/ProductCard.module.css";
import ProductCardProps from "../interface/ProductCardProps";
import Link from "next/link";
import { useCart } from "../context/CartConText";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { addToWishlist } from "../../lib/wishlistApi"; // Import hàm API để thêm vào wishlist
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaStar, FaRegStar } from "react-icons/fa";

export default function ProductCard({
  id,
  name,
  slug,
  image,
  brand,
  price,
  originalPrice,
  discount,
  sold = 0,
  average_rating = 0,
  type_skin,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const { user } = useAuth(); // Kiểm tra đăng nhập
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      image: image || "",
      price: price || 0,
      originalPrice: originalPrice || 0,
      quantity: 1,
      final_price_discount: discount ? price || 0 : price || 0,
      sale_price: price || 0,
      productId: id,
      variantId: 0,
      options: [],
      discount: 0,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  let toastId: string | undefined;

const handleAddToWishlist = async (e: React.MouseEvent) => {
  e.preventDefault();

  // Nếu đang thêm vào wishlist, không cho phép bấm lại
  if (isAddingToWishlist) return;

  setIsAddingToWishlist(true); // Đánh dấu đang thêm vào wishlist

  // Kiểm tra nếu chưa đăng nhập
  if (!user) {
    if (toastId) {
      toast.dismiss(toastId); // Đảm bảo toastId có giá trị hợp lệ
    }
    toastId = toast.info("Vui lòng đăng nhập để thêm vào wishlist 🔐") as string;

    setTimeout(() => {
      setLoginModalOpen(true); // Hiển thị modal đăng nhập sau khi toast đã hiển thị
    }, 500);

    setIsAddingToWishlist(false); // Đánh dấu kết thúc quá trình
    return;
  }

  try {
    await addToWishlist(slug);

    if (toastId) {
      toast.dismiss(toastId); // Đảm bảo toastId có giá trị hợp lệ
    }
    toastId = toast.success("Đã thêm vào danh sách yêu thích 💖") as string;
  } catch (error: any) {
    const message = error?.response?.data?.message?.toLowerCase() ?? "";

    if (message.includes("danh sách yêu thích") || message.includes("đã có")) {
      if (toastId) {
        toast.dismiss(toastId); // Đảm bảo toastId có giá trị hợp lệ
      }
      toastId = toast.warning("Sản phẩm đã có trong wishlist 🧐") as string;
    } else {
      if (toastId) {
        toast.dismiss(toastId); // Đảm bảo toastId có giá trị hợp lệ
      }
      toastId = toast.error("Đã xảy ra lỗi, vui lòng thử lại sau 😢") as string;
    }
  } finally {
    setIsAddingToWishlist(false); // Đánh dấu kết thúc quá trình
  }
};


  const formatPrice = (value: number | null | undefined) =>
    value ? value.toLocaleString("vi-VN") + "₫" : "";

  return (
    <div>
      <section className={styles.card}>
        {discount && discount > 0 && (
          <span className={styles.discount}>-{discount}%</span>
        )}
        <Link href={`/products/${slug}`}>
          <Image
            src={image}
            alt={name}
            className={styles.image}
            width={300}
            height={300}
          />
        </Link>
        <p className={styles.brand}>{brand}</p>
        <h3 className={styles.name}>{name}</h3>

        <p className={styles.price}>
          {formatPrice(price)}{" "}
          {originalPrice && originalPrice > price && (
            <span className={styles.original}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </p>

        <div className={styles.stars}>
          {[...Array(5)].map((_, i) =>
            i < Math.round(average_rating) ? (
              <FaStar key={i} color="#FFD700" />
            ) : (
              <FaRegStar key={i} color="#ccc" />
            )
          )}
          <span>({average_rating.toFixed(1)} đánh giá)</span>
        </div>

        <div className={styles.progress}>
          <div className={styles.bar} style={{ width: `${sold}%` }}></div>
        </div>
        <p className={styles.sold}>{sold} sản phẩm đã bán</p>

        <div className={styles.actions}>
          <button className={styles.wishlist} onClick={(e) => handleAddToWishlist(e)}>
            <FaHeart size={20} color="red" />
          </button>
        </div>
      </section>

      {/* Modal đăng nhập */}
      {isLoginModalOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className="text-lg font-semibold mb-4">Vui lòng đăng nhập</h2>
            <p className="mb-4 text-sm text-gray-600">
              Bạn cần đăng nhập để sử dụng wishlist.
            </p>
            <button
              className={styles.button}
              onClick={() => {
                setLoginModalOpen(false);
                router.push("/login");
              }}
            >
              Đăng nhập
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
