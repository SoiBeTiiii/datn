"use client";
import { Filter } from "lucide-react";
import styles from "./products.module.css";
import ProductCard from "../components/ProductCard";
import React, { useEffect, useState } from "react";
import { fetchProducts, fetchProductsByFilterKey } from "../../lib/productApi";
import ProductCardProps from "../interface/ProductCardProps";
import { useSearchParams, useRouter } from "next/navigation";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const keyword = searchParams.get("keyword") || undefined;
  const category = searchParams.get("category") || undefined;
  const brandParam = searchParams.get("brand") || undefined;
  const sortParam = searchParams.get("sort") || "";

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [sort, setSort] = useState<string>(sortParam);
  const [brands, setBrands] = useState<string[]>(
    brandParam ? [brandParam] : []
  );
  const [types, setTypes] = useState<string[]>([]);
  const [typeSkin, setTypeSkin] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoryParam = searchParams.get("category");
        const brandParam = searchParams.get("brand");
        const sortParam = searchParams.get("sort") || sort;

        let fetchedProducts: ProductCardProps[] = [];

        if (categoryParam) {
          fetchedProducts = await fetchProductsByFilterKey(
            "category",
            categoryParam,
            sortParam
          );
        } else if (brandParam) {
          fetchedProducts = await fetchProductsByFilterKey(
            "brand",
            brandParam,
            sortParam
          );
        } else {
          fetchedProducts = await fetchProducts({
            sort: sortParam,
            brand: brands,
            types,
            type_skin: typeSkin,
            price_range: priceRange,
            keyword: keyword ?? undefined,
          });
        }
        
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Lỗi khi fetch sản phẩm:", err);
      }
    };

    fetchData();
  }, [searchParams, sort, brands, types, typeSkin, priceRange, keyword]);

  const updateURLParams = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort) {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);

    router.push(`/products?${params.toString()}`);
  };

  const handleCheckboxChange = (
    value: string,
    stateArray: string[],
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const brandOptions = [
    { slug: "1", name: "OHUI" },
    { slug: "2", name: "WHOO" },
    { slug: "3", name: "SUM37" },
    { slug: "4", name: "SULWHASOO" },
    { slug: "5", name: "CNP" },
  ];

  const typeOptions = [
    { id: "1", name: "Áo Thun nam" },
    { id: "2", name: "Tinh chất" },
    { id: "3", name: "Trang điểm" },
    { id: "4", name: "Kem dưỡng" },
    { id: "5", name: "Sữa rửa mặt" },
  ];

  const skinOptions = [
    "Da hỗn hợp",
    "da dầu",
    "Da lão hóa",
    "Da nám/tàn nhang",
  ];

  return (
    <section className={styles["product-page"]}>
      <aside className={styles["filter-sidebar"]}>
        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Thương hiệu</h2>
          {brandOptions.map((brand) => (
            <label key={brand.slug}>
              <input
                type="checkbox"
                checked={brands.includes(brand.slug)}
                onChange={() =>
                  handleCheckboxChange(brand.slug, brands, setBrands)
                }
              />
              {brand.name}
            </label>
          ))}
        </div>

        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Mức giá</h2>
          {[
            "0-500000",
            "500000-1000000",
            "1000000-2000000",
            "2000000-5000000",
            "10000000-99999999",
          ].map((range) => (
            <label key={range}>
              <input
                type="checkbox"
                checked={priceRange.includes(range)}
                onChange={() =>
                  handleCheckboxChange(range, priceRange, setPriceRange)
                }
              />
              {range.replace("-", "đ - ")}đ
            </label>
          ))}
        </div>

        {/* <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Loại</h2>
          {typeOptions.map((type) => (
            <label key={type.id}>
              <input
                type="checkbox"
                checked={types.includes(type.name)}
                onChange={() =>
                  handleCheckboxChange(type.name, types, setTypes)
                }
              />
              {type.name}
            </label>
          ))}
        </div> */}

        <div className={styles["filter-section"]}>
          <h2 className={styles["filter-title"]}>Loại da</h2>
          {skinOptions.map((skin) => (
            <label key={skin}>
              <input
                type="checkbox"
                checked={typeSkin.includes(skin)}
                onChange={() =>
                  handleCheckboxChange(skin, typeSkin, setTypeSkin)
                }
              />
              {skin}
            </label>
          ))}
        </div>
      </aside>

      <section className={styles["product-list"]}>
        <h2 className={styles["section-title"]}>Tất cả sản phẩm</h2>

        <div className={styles["sort-options"]}>
          <span className={styles["sort-label"]}>Sắp xếp:</span>
          {[
            ["a-z", "Tên A → Z"],
            ["z-a", "Tên Z → A"],
            ["price_asc", "Giá tăng dần"],
            ["price_desc", "Giá giảm dần"],
            ["new", "Hàng mới"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSortChange(key)}
              className={`${styles["sort-btn"]} ${
                sort === key ? styles.active : ""
              }`}
            >
              {label}
            </button>
          ))}
          ;
        </div>

        <div className={styles["sort-dropdown-mobile"]}>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className={styles["mobile-select"]}
          >
            <option value="a-z">Tên A → Z</option>
            <option value="z-a">Tên Z → A</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
            <option value="new">Hàng mới</option>
          </select>
        </div>

        <button
          className={styles["mobile-filter-btn"]}
          onClick={() => setIsMobileFilterOpen(true)}
        >
          <Filter size={18} className={styles["filter-icon"]} /> Bộ lọc
        </button>

        {isMobileFilterOpen && (
          <div className={styles["mobile-filter-overlay"]}>
            <div className={styles["mobile-filter-drawer"]}>
              <button
                className={styles["close-btn"]}
                onClick={() => setIsMobileFilterOpen(false)}
              >
                ✕ Đóng
              </button>

              <div className={styles["filter-section"]}>
                <h2>Thương hiệu</h2>
                {brandOptions.map((brand) => (
                  <label key={brand.slug}>
                    <input
                      type="checkbox"
                      checked={brands.includes(brand.slug)}
                      onChange={() =>
                        handleCheckboxChange(brand.slug, brands, setBrands)
                      }
                    />
                    {brand.name}
                  </label>
                ))}
              </div>

              <div className={styles["filter-section"]}>
                <h2>Mức giá</h2>
                {[
                  "0-500000",
                  "500000-1000000",
                  "1000000-2000000",
                  "2000000-5000000",
                  "10000000-99999999",
                ].map((range) => (
                  <label key={range}>
                    <input
                      type="checkbox"
                      checked={priceRange.includes(range)}
                      onChange={() =>
                        handleCheckboxChange(range, priceRange, setPriceRange)
                      }
                    />
                    {range.replace("-", "đ - ")}đ
                  </label>
                ))}
              </div>

              {/* <div className={styles["filter-section"]}>
                <h2>Loại</h2>
                {typeOptions.map((type) => (
                  <label key={type.id}>
                    <input
                      type="checkbox"
                      checked={types.includes(type.name)}
                      onChange={() =>
                        handleCheckboxChange(type.name, types, setTypes)
                      }
                    />
                    {type.name}
                  </label>
                ))}
              </div> */}

              <div className={styles["filter-section"]}>
                <h2>Loại da</h2>
                {skinOptions.map((skin) => (
                  <label key={skin}>
                    <input
                      type="checkbox"
                      checked={typeSkin.includes(skin)}
                      onChange={() =>
                        handleCheckboxChange(skin, typeSkin, setTypeSkin)
                      }
                    />
                    {skin}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className={styles["product-grid"]}>
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </section>
    </section>
  );
}
