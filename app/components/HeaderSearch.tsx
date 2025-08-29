"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ✅ ĐÚNG cho App Router
import {
  MdMenu,
  MdStore,
  MdEdit,
  MdPerson,
  MdFavorite,
  MdShoppingCart,
  MdSearch,
} from "react-icons/md";
import Link from "next/link";
import CartDrawer from "./CartDrawer";
import WishlistDrawer from "./WishlistDrawer";
import MobileMenu from "./MobileMenu";
import { useCart } from "../context/CartConText";
import { useAuth } from "../context/AuthContext";
import searchProducts from "../../lib/searchApi";
import { useRef } from "react";

import {
  addToWishlist,
  getWishlists,
  removeFromWishlist,
} from "../../lib/wishlistApi";
import { fetchCategories } from "../../lib/categoryApi";
import Category from "../../app/interface/Category";
import styles from "../css/HeaderSearch.module.css";

export default function Header() {
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, logout } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<any[]>([]); // Danh sách sản phẩm yêu thích
  const { cart } = useCart();
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  const [isScrolled, setIsScrolled] = useState(false); // Trạng thái cuộn

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (keyword.trim()) {
        try {
          const data = await searchProducts(keyword);
          setResults(data);
          setShowResults(true);
        } catch (err) {
          console.error("Lỗi tìm kiếm:", err);
          setResults([]);
          setShowResults(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounce);
  }, [keyword]);

  // Fetch wishlist khi component mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const data = (await getWishlists()) as { data: any[] }; // Fetch wishlist từ API
        if (data && Array.isArray(data.data)) {
          setWishlistItems(data.data); // Cập nhật danh sách sản phẩm yêu thích
        } else {
          console.error("Dữ liệu wishlist không hợp lệ", data);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist(); // Gọi hàm fetch wishlist
  }, []);

  // Fetch categories data
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategoriesData();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!keyword.trim()) return;
    try {
      const data = await searchProducts(keyword);
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      router.push(`/search?search=${encodeURIComponent(keyword)}`);
    }
  };

  // Thêm vào wishlist
  const handleAddToWishlist = async (slug: string) => {
    try {
      await addToWishlist(slug);
      setWishlistItems((prev) => [...prev, slug]); // Thêm sản phẩm vào wishlist
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  // Xóa khỏi wishlist
  const handleRemoveFromWishlist = async (slug: string) => {
    try {
      await removeFromWishlist(slug);
      setWishlistItems((prev) => prev.filter((item) => item.slug !== slug)); // Xóa sản phẩm khỏi wishlist
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  // Effect để theo dõi cuộn trang
  const [lastScrollY, setLastScrollY] = useState(0);

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    if (currentScrollY > lastScrollY) {
      setIsScrolled(true); // Hide header when scrolling down
    } else {
      setIsScrolled(false); // Show header when scrolling up
    }
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll); // Cleanup on component unmount
    };
  }, [lastScrollY]);

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.hide : styles.show}`}
      >
        {/* Các phần tử khác */}
        <div className={styles.topBar}>
          <p>
            FRESHIAN TRANG ĐIỂM THUẦN CHAY CAO CẤP · FREESHIP 15K ĐƠN TỪ 199K ·
            Mua online nhận nhanh tại cửa hàng · Giao nhanh 24H tại Tp. Hồ Chí
            Minh
          </p>
        </div>

        {/* Main Header Bar */}
        <div className={styles.mainBar}>
          {/* === Thanh tìm kiếm riêng cho mobile === */}

          <div
            className={styles.menuIcon}
            onClick={() => setMobileMenuOpen(true)}
          >
            <MdMenu size={24} />
          </div>
          <Link href="/">
            <img
              src="https://res.cloudinary.com/dnj08gvqi/image/upload/v1756454387/xu4dhv120cj7qdfk07dg.png"
              className={styles.logo}
              alt=""
            />
          </Link>

          {/* <div className={styles.logo}>EGOMall</div> */}
          {/* === Nhóm icon Wishlist + Giỏ hàng mobile === */}
          <div className={styles.mobileIcons}>
            {/* Wishlist */}
            <div
              className={styles.iconItem}
              onClick={() => setWishlistOpen(true)}
            >
              <MdFavorite size={22} />
              {wishlistItems.length > 0 && (
                <span className={styles.iconBadge}>{wishlistItems.length}</span>
              )}
            </div>

            {/* Giỏ hàng */}
            <div className={styles.iconItem} onClick={() => setCartOpen(true)}>
              <MdShoppingCart size={22} />
              {totalQuantity > 0 && (
                <span className={styles.iconBadge}>{totalQuantity}</span>
              )}
            </div>
          </div>

          {/* Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/search?search=${encodeURIComponent(keyword)}`);
              setShowResults(false);
            }}
            className={styles.searchBox}
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/search?search=${encodeURIComponent(keyword)}`);
                  setShowResults(false);
                }
              }}
            />
            <MdSearch
              className={styles.searchIcon}
              onClick={() => {
                router.push(`/search?search=${encodeURIComponent(keyword)}`);
                setShowResults(false);
              }}
              style={{ cursor: "pointer" }}
            />

            {showResults && results.length > 0 && (
              <ul className={styles.searchDropdown}>
                {results.slice(0, 5).map((item) => (
                  <li
                    key={item.slug}
                    className={styles.searchItem}
                    onClick={() => {
                      router.push(`/products/${item.slug}`);
                      setShowResults(false);
                      setKeyword(""); // clear text
                      setResults([]); // clear gợi ý
                      inputRef.current?.blur(); // ❗ bỏ focus để dropdown không bật lại
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.resultImage}
                    />
                    <span>{item.name}</span>
                    <span>{item.sold_count}</span>
                    <span>{item.rating}</span>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Icon List (Contact, Blog, etc.) */}
          <div className={styles.iconList}>
            {/* <div className={styles.iconItem}>
              <MdStore size={20} />
              <span>Liên hệ</span>
            </div> */}
            <Link href="/blog" className={styles.iconLink}>
              <div className={styles.iconItem}>
                <MdEdit size={20} />
                <span>Bài viết</span>
              </div>
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className={styles.userDropdown}>
                <Link href="/profile" className={styles.iconLink}>
                  <div className={styles.iconItem}>
                    <MdPerson size={20} />
                    <span>{user.name}</span>
                  </div>
                </Link>
                <div className={styles.dropdownContent}>
                  <button onClick={logout} className={styles.logoutButton}>
                    <span className={styles.logoutText}>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className={styles.iconLink}>
                <div className={styles.iconItem}>
                  <MdPerson size={20} />
                  <span>Đăng nhập</span>
                </div>
              </Link>
            )}

            {/* Wishlist Icon */}
            <div
              className={styles.iconItem}
              onClick={() => setWishlistOpen(true)}
            >
              <MdFavorite size={20} />
              <span>Đã thích</span>
            </div>

            {/* Cart Icon */}
            <div className={styles.iconItem} onClick={() => setCartOpen(true)}>
              <div className={styles.cartWrapper}>
                <MdShoppingCart size={20} />
                {totalQuantity > 0 && (
                  <span className={styles.cartBadge}>{totalQuantity}</span>
                )}
              </div>
              <span>Giỏ hàng</span>
            </div>
          </div>
        </div>
        {/* === Thanh tìm kiếm riêng cho mobile === */}
        <div suppressHydrationWarning>
          <div className={styles.mobileSearchBar}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/search?search=${encodeURIComponent(keyword)}`);
                setShowResults(false);
                setKeyword(""); // ✅ clear input sau khi search
              }}
            >
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onFocus={() => keyword.trim() && setShowResults(true)}
              />
              <button type="submit">
                <MdSearch size={20} />
              </button>
            </form>

            {/* Dropdown gợi ý sản phẩm */}
            {showResults && results.length > 0 && (
              <ul className={styles.mobileSearchDropdown}>
                {results.slice(0, 6).map((item) => (
                  <li
                    key={item.slug}
                    className={styles.mobileSearchItem}
                    onClick={() => {
                      router.push(`/products/${item.slug}`);
                      setShowResults(false);
                      setKeyword("");
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.mobileResultImage}
                    />
                    <span>{item.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Mobile Menu and Mobile Search Box */}
        <nav className={styles.nav}>
          <ul>
            <Link href="/">
              <li>Trang chủ</li>
            </Link>
            <Link href="/products">
              <li>Sản phẩm</li>
            </Link>
            {categories.map((parent) => (
              <li key={parent.id} className={styles.navItem}>
                <Link href={`/products?category=${parent.slug}`}>
                  {parent.name}
                </Link>
                <div className={styles.megaMenu}>
                  {parent.children?.map((child) => (
                    <div key={child.id} className={styles.megaColumn}>
                      <Link href={`/products?category=${child.slug}`}>
                        <h4>{child.name}</h4>
                      </Link>
                      {child.children?.map((grandchild) => (
                        <Link
                          key={grandchild.id}
                          href={`/products?category=${grandchild.slug}`}
                        >
                          <span>{grandchild.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Drawers */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistDrawer
        isOpen={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        WishlistItems={wishlistItems}
        onAddToWishlist={handleAddToWishlist}
        onRemoveFromWishlist={handleRemoveFromWishlist}
      />
      {mobileMenuOpen && (
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
