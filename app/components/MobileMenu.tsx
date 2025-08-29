"use client";

import { MdClose, MdPerson } from "react-icons/md";
import styles from "../css/MobileMenu.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchCategories } from "../../lib/categoryApi";
import fetchBrands from "../../lib/brandApi";
import Category from "../../app/interface/Category";
import BrandProps from "@/app/interface/brand";
import { useAuth } from "../context/AuthContext"; // 👈 dùng lại context như Header
import { useRouter } from "next/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user } = useAuth(); // 👈 có user?.name khi đã login
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toggle = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  // Fetch categories + brands khi mở menu
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      setLoading(true);

      try {
        const [categoriesData, brandsData] = await Promise.all([
          fetchCategories(),
          fetchBrands(),
        ]);

        setCategories(categoriesData);

        // ✅ Lọc trùng brands theo slug + name (lowercase)
        const uniqueBrands = [
          ...new Map(
            brandsData.map((item) => [
              `${(item.slug || "").toLowerCase()}-${(item.name || "").toLowerCase()}`,
              item,
            ])
          ).values(),
        ];

        setBrands(uniqueBrands);
      } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu menu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <div className={`${styles.menuDrawer} ${isOpen ? styles.open : ""}`}>
        <div className={styles.menuHeader}>
          <span className={styles.logo}>EGOMall</span>
          <MdClose size={24} className={styles.closeIcon} onClick={onClose} />
        </div>

        {/* 👇 Hàng auth: Đăng nhập / Tên user */}
        <div className={styles.authRow}>
          {user ? (
            <Link href="/profile" onClick={onClose} className={styles.authLink}>
              <MdPerson size={20} className={styles.authIcon} />
              <span className={styles.authName}>{user.name}</span>
            </Link>
          ) : (
            <Link href="/login" onClick={onClose} className={styles.authLink}>
              <MdPerson size={20} className={styles.authIcon} />
              <span className={styles.authName}>Đăng nhập</span>
            </Link>
          )}
        </div>

        {loading ? (
          <p className={styles.loading}>Đang tải dữ liệu...</p>
        ) : (
          <>
            {/* Danh mục */}
            {categories.map((parent) => (
              <div key={parent.id} className={styles.menuItem}>
                <div onClick={() => toggle(parent.slug)}>{parent.name}</div>

                {openMenu === parent.slug && (parent.children?.length ?? 0) > 0 && (
                  <div className={styles.subMenu}>
                    {parent.children?.map((child) => (
                      <div key={child.id} className={styles.subMenuItem}>
                        <Link
                          href={`/products?category=${child.slug}`}
                          onClick={onClose}
                        >
                          <h4>{child.name}</h4>
                        </Link>

                        {(child.children?.length ?? 0) > 0 && (
                          <div className={styles.subSubMenu}>
                            {child.children?.map((grandchild) => (
                              <Link
                                key={grandchild.id}
                                href={`/products?category=${grandchild.slug}`}
                                onClick={onClose}
                              >
                                <span>{grandchild.name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Thương hiệu: danh sách tên (gọn) */}
            <div className={styles.menuItem} onClick={() => toggle("brands")}>
              Thương hiệu
            </div>
            {openMenu === "brands" && brands.length > 0 && (
              <div className={styles.brandSection}>
                {/* Optional: lưới ảnh (lấy logo/banner) — có thể ẩn nếu chưa cần */}
                <div className={styles.brandGrid}>
                  {brands.slice(0, 8).map((b) => (
                    <Link
                      key={`card-${b.id || b.slug}`}
                      href={`/products?brand=${b.slug}`}
                      onClick={onClose}
                      className={styles.brandCard}
                    >
                      <img
                        src={(b as any).banner || b.logo}
                        alt={b.name}
                        className={styles.brandImg}
                      />
                      <span className={styles.brandCardTitle}>{b.slug}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mục tĩnh */}
           <Link href="/blog" className={styles.menuItema} >
              Bài viết
            </Link>
          </>
        )}
      </div>
    </>
  );
}
