"use client";
import { useEffect, useState } from "react";
import { fetchPromotedProducts } from "@/lib/productApi";
import ProductCardProps from "@/app/interface/ProductCardProps";
import styles from "./promotionPage.module.css"
import ProductCard from "../components/ProductCard";

export default function PromotionList() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);

  useEffect(() => {
    fetchPromotedProducts().then(setProducts);
  }, []);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Sản phẩm khuyến mãi
      </h2>

      <div className={styles.grid}>
        {products.map((product, index) => (
          <ProductCard key={index} {...product} />
        ))}
      </div>
    </div>
  );
}
