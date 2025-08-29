"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import styles from "../css/ProductListSlider.module.css";
import { fetchProducts } from "../../lib/productApi";
import ProductCardProps from "../interface/ProductCardProps";

const ITEMS_PER_PAGE = 4;

export default function ProductListSlider() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((err) => {
        console.error("Lỗi khi fetch sản phẩm:", err);
      });
      
  }, []);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const next = () => setPage((prev) => (prev + 1) % totalPages);
  const prev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  return (
    <div className={styles.wrapper}>
      <div className={styles.sliderContainer}>
              <h2 className={styles.title}>Sản phẩm bạn có thể thích</h2>
        
        <div
          className={styles.sliderTrack}
          style={{
            transform: `translateX(-${page * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {products.map((p) => (
            <div className={styles.slide} key={p.id}>
              <ProductCard
                id={p.id}
                slug={p.slug}
                name={p.name}
                brand={p.brand}
                price={p.price}
                originalPrice={p.originalPrice}
                image={p.image}
                sold={p.sold}
                discount={p.discount}
                average_rating={p.average_rating}
                type={p.type}
                type_skin={p.type_skin}
                variants={[]}
                is_featured={false}
              />
            </div>
          ))}
        </div>
      </div>
      <div className={styles.controls}>
        <button className={styles.arrow} onClick={prev}>
          ◀
        </button>
        <button className={styles.arrow} onClick={next}>
          ▶
        </button>
      </div>
    </div>
  );
}
