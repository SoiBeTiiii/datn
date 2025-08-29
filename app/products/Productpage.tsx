"use client";
import { Filter, X } from "lucide-react";
import styles from "./products.module.css";
import ProductCard from "../components/ProductCard";
import React, { useEffect, useMemo, useState } from "react";
import { fetchProducts, fetchTypeSkinOnly } from "../../lib/productApi";
import ProductCardProps from "../interface/ProductCardProps";
import { useSearchParams, useRouter } from "next/navigation";
import fetchBrands from "../../lib/brandApi";
import BrandProps from "../interface/brand";
import BackToHomeButton from "../components/BackToHomeButton";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const keyword = searchParams.get("keyword") || undefined;
  const category = searchParams.get("category") || undefined;
  const brandParam = searchParams.get("brand") || undefined;
  const sortParam = searchParams.get("sort") || "";
  const urlIsFeatured = searchParams.get("is_featured") === "1"; // ⬅️ đọc từ URL

  const [availableTypeSkins, setAvailableTypeSkins] = useState<string[]>([]);
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [sort, setSort] = useState<string>(urlIsFeatured ? "is_featured" : sortParam); // ⬅️ sync init
  const [brands, setBrands] = useState<string[]>(brandParam ? [brandParam] : []);
  const [types, setTypes] = useState<string[]>([]);
  const [typeSkin, setTypeSkin] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandProps[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageClick = (page: number) => setCurrentPage(page);

  // Fetch brand list
  useEffect(() => {
    fetchBrands().then(setFilteredBrands);
  }, []);

  // Fetch type_skin options
  useEffect(() => {
    const loadTypeSkin = async () => {
      const skins = await fetchTypeSkinOnly();
      const capitalizedSkins = skins.map((s) => s.charAt(0).toUpperCase() + s.slice(1));
      setAvailableTypeSkins(capitalizedSkins);
    };
    loadTypeSkin();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ⬅️ nếu đang ở "Nổi bật" (qua sort === 'is_featured' hoặc URL có is_featured=1)
        const isFeaturedFlag = urlIsFeatured || sort === "is_featured";

        const fetchedProducts = await fetchProducts({
          // IMPORTANT: gửi đúng query cho BE
          is_featured: isFeaturedFlag ? 1 : undefined,

          // chỉ gửi sort nếu KHÔNG phải chế độ "Nổi bật"
          sort: !isFeaturedFlag ? sortParam : undefined,

          brand: brandParam ? [brandParam] : brands,
          category: category ?? undefined,
          types,
          type_skin: typeSkin,
          price_range: priceRange,
          keyword: keyword ?? undefined,
        });

        setProducts(fetchedProducts);
        setCurrentPage(1); // về trang 1 mỗi khi filter/sort đổi
      } catch (err) {
        console.error("Lỗi khi fetch sản phẩm:", err);
      }
    };

    fetchData();
  }, [
    searchParams,
    sort,
    brands,
    types,
    typeSkin,
    priceRange,
    keyword,
    category,
    urlIsFeatured,
    sortParam,
  ]);

  // Update URL when sort changes
  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams.toString());

    if (value === "is_featured") {
      // ⬅️ chọn Nổi bật -> dùng is_featured=1, bỏ sort
      params.delete("sort");
      params.set("is_featured", "1");
    } else {
      // ⬅️ các sort khác -> dùng sort, bỏ is_featured
      params.delete("is_featured");
      params.set("sort", value);
    }

    router.push(`/products?${params.toString()}`);
  };

  // Checkbox filter change
  const handleCheckboxChange = (
    value: string,
    stateArray: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  // Active của nút "Nổi bật" dựa theo URL hoặc state
  const isFeaturedActive = urlIsFeatured || sort === "is_featured";

  return (
    
    <section className={styles["product-page"]}>
      {/* Sidebar filter for desktop */}
      <BackToHomeButton />
      <aside className={styles["filter-sidebar"]}>
        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Thương hiệu</h2>
          {filteredBrands.map((brand) => (
            <label key={brand.slug}>
              <input
                type="checkbox"
                checked={brands.includes(brand.slug)}
                onChange={() => handleCheckboxChange(brand.slug, brands, setBrands)}
              />
              {brand.slug}
            </label>
          ))}
        </div>

        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Mức giá</h2>
          {["0-500000", "500000-1000000", "1000000-2000000", "2000000-5000000", "10000000-99999999"].map(
            (range) => (
              <label key={range}>
                <input
                  type="checkbox"
                  checked={priceRange.includes(range)}
                  onChange={() => handleCheckboxChange(range, priceRange, setPriceRange)}
                />
                {range.replace("-", "đ - ")}đ
              </label>
            )
          )}
        </div>

        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Loại da</h2>
          {availableTypeSkins.map((skins) => (
            <label key={skins}>
              <input
                type="checkbox"
                checked={typeSkin.includes(skins)}
                onChange={() => handleCheckboxChange(skins, typeSkin, setTypeSkin)}
              />
              {skins}
            </label>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <section className={styles["product-list"]}>
        <h2 className={styles["section-title"]}>Tất cả sản phẩm</h2>

        {/* Sort buttons (desktop) */}
        <div className={styles["sort-options"]}>
          <span className={styles["sort-label"]}>Sắp xếp:</span>
          {[
            ["a-z", "Tên A → Z"],
            ["z-a", "Tên Z → A"],
            ["price_asc", "Giá tăng dần"],
            ["price_desc", "Giá giảm dần"],
            ["new", "Hàng mới"],
            ["is_featured", "Nổi bật"], // ⬅️ thêm ở đây
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={`${styles["sort-btn"]} ${
                key === "is_featured"
                  ? isFeaturedActive
                    ? styles.active
                    : ""
                  : sort === key
                  ? styles.active
                  : ""
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filter icon only on mobile */}
        <button
          className={styles["mobile-filter-btn"]}
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <Filter size={18} className={styles["filter-icon"]} />
          Bộ lọc
        </button>

        {/* Sort dropdown mobile */}
        <div className={styles["sort-dropdown-mobile"]}>
          <select
            value={isFeaturedActive ? "is_featured" : sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles["mobile-select"]}
          >
            <option value="a-z">Tên A → Z</option>
            <option value="z-a">Tên Z → A</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="new">Hàng mới</option>
            <option value="is_featured">Nổi bật</option> {/* ⬅️ thêm mobile */}
          </select>
        </div>

        {/* Product list */}
        <div className={styles["product-grid"]}>
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`${styles["page-btn"]} ${currentPage === i + 1 ? styles.active : ""}`}
              onClick={() => handlePageClick(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </section>

      {/* Popup Filter Mobile */}
      {isMobileFilterOpen && (
        <>
          {/* Overlay */}
          <div
            className={styles["mobile-filter-overlay"]}
            onClick={() => setIsMobileFilterOpen(false)}
          />
          {/* Drawer */}
          <div className={styles["mobile-filter-drawer"]}>
            <button
              className={styles["close-btn"]}
              onClick={() => setIsMobileFilterOpen(false)}
            >
              <X size={20} />
            </button>

            {/* Bộ lọc trong popup */}
            <h3 className={styles["filter-title"]}>Thương hiệu</h3>
            {filteredBrands.map((brand) => (
              <label key={brand.slug}>
                <input
                  type="checkbox"
                  checked={brands.includes(brand.slug)}
                  onChange={() => handleCheckboxChange(brand.slug, brands, setBrands)}
                />
                {brand.slug}
              </label>
            ))}

            <h3 className={styles["filter-title"]}>Mức giá</h3>
            {["0-500000", "500000-1000000", "1000000-2000000", "2000000-5000000", "10000000-99999999"].map(
              (range) => (
                <label key={range}>
                  <input
                    type="checkbox"
                    checked={priceRange.includes(range)}
                    onChange={() => handleCheckboxChange(range, priceRange, setPriceRange)}
                  />
                  {range.replace("-", "đ - ")}đ
                </label>
              )
            )}

            <h3 className={styles["filter-title"]}>Loại da</h3>
            {availableTypeSkins.map((skins) => (
              <label key={skins}>
                <input
                  type="checkbox"
                  checked={typeSkin.includes(skins)}
                  onChange={() => handleCheckboxChange(skins, typeSkin, setTypeSkin)}
                />
                {skins}
              </label>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
