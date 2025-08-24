"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import styles from "../css/ProductListSlider.module.css";
import ButtonFromIntro from "../css/IntroSlider.module.css";
import { fetchProducts } from "../../lib/productApi";
import ProductCardProps from "../interface/ProductCardProps";

export default function ProductListSlider() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        const productsWithId = data.map((item, index) => {
          const variants = item.variants || [];

          let finalPrice = null;
          let price = null;

          if (variants.length > 0) {
            const getLowest = (field: keyof (typeof variants)[0]) => {
              const values = variants
                .map((v) => v[field])
                .filter((val) => val !== null && val !== undefined);
              return values.length > 0 ? Math.min(...values) : null;
            };

            const finalPriceDiscount = getLowest("final_price_discount");
            const salePrice = getLowest("sale_price");
            const basePrice = getLowest("price");

            finalPrice = finalPriceDiscount ?? salePrice ?? basePrice;
            price = basePrice;
          }

          return {
            variants: variants,
            id: item.id ?? index,
            name: item.name,
            slug: item.slug,
            image: item.image,
            brand: item.brand,
            price: finalPrice ?? 0,
            originalPrice:
              price !== finalPrice && price !== null ? price : undefined,
            discount:
              price && finalPrice && price > finalPrice
                ? Math.round(((price - finalPrice) / price) * 100)
                : 0,
            sold: item.sold ?? 0,
            average_rating: item.average_rating ?? 0,
            type: item.type ?? "",
            type_skin: item.type_skin ?? "",
          };
        });

        setProducts(productsWithId);
      })
      .catch((err) => {
        console.error("Lỗi khi fetch sản phẩm:", err);
      });
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const next = () => setPage((prev) => (prev + 1) % totalPages);
  const prev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Sản phẩm nổi bật</h2>
      <div className={styles.sliderContainer}>
        <div
          className={styles.sliderTrack}
          style={{
            transform: `translateX(-${page * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {products.map((p, index) => (
            <div className={styles.slide} key={p.id}>
              <ProductCard {...p} />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.arrow} onClick={prev}>
          ◀
        </button>
        <button className={ButtonFromIntro.button}>Xem thêm</button>
        <button className={styles.arrow} onClick={next}>
          ▶
        </button>
      </div>
    </div>
  );
}
