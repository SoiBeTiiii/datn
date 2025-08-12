'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import baseAxios from "../../lib/baseAxios";
import ProductCard from "../components/ProductCard";
import ProductCardProps from "../interface/ProductCardProps";
import styles from "./SearchPage.module.css";

export default function SearchPage() {
  const [results, setResults] = useState<ProductCardProps[]>([]);
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search");

  useEffect(() => {
    if (!keyword) return;

    const fetchSearchResults = async () => {
      try {
        const res = await baseAxios.get(`/search?search=${keyword}`);
        const data = res.data as { data: ProductCardProps[] };
        setResults(data.data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        Có {results.length} kết quả cho: <span>{keyword}</span>
      </h2>

      <div className={styles.grid}>
        {results.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </div>
  );
}
