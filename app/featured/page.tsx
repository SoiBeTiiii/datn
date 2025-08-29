"use client";
import { useEffect, useState } from "react";
import { fetchFeaturedProducts } from "@/lib/productApi";
import ProductCardProps from "@/app/interface/ProductCardProps";
import styles from "./featuredPage.module.css"
import ProductCard from "../components/ProductCard";
import BackToHomeButton from "../components/BackToHomeButton";

export default function FeaturedList() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);

  useEffect(() => {
    fetchFeaturedProducts().then(setProducts);
  }, []);

  return (
    <div className={styles.container}>
      <BackToHomeButton />
      <h2 className={styles.title}>
        Sản phẩm nổi bật
      </h2>

      <div className={styles.grid}>
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </div>
  );
}
