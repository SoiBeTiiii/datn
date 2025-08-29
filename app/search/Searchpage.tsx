'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import baseAxios from "../../lib/baseAxios";
import ProductCard from "../components/ProductCard";
import ProductCardProps from "../interface/ProductCardProps";
import styles from "./SearchPage.module.css";
import BackToHomeButton from "../components/BackToHomeButton";

// Kiểu dữ liệu trả từ API (theo Postman bạn đưa)
type ApiItem = {
  id: number;
  name: string;
  slug: string;
  image?: string;
  final_price?: number;
  sold_count?: number;
  average_rating?: number;
  brand?: { name?: string } | string | null;
};

type ApiResponse<T> = {
  data: T;
};

export default function SearchPage() {
  const [results, setResults] = useState<ProductCardProps[]>([]);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const keyword = searchParams.get("search") ?? "";

  useEffect(() => {
    if (!keyword) {
      setResults([]);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);

        const res = await baseAxios.get<ApiResponse<ApiItem[]>>("/search", {
          params: { search: keyword },
        });

        const apiItems = res.data.data ?? [];

        const mapped: ProductCardProps[] = apiItems.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          image: p.image ?? "",
          price: p.final_price ?? 0,         // map final_price -> price
          originalPrice: null,
          discount: undefined,
          sold_count: p.sold_count ?? 0,
          average_rating: p.average_rating ?? 0,
          brand: typeof p.brand === "string" ? p.brand : (p.brand?.name ?? ""),
          is_featured: false,
          variants: [],                      // không có từ API -> []
          type: undefined,
          type_skin: "",
        }));

        setResults(mapped);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [keyword]);

  return (
    <div className={styles.container}>
      <BackToHomeButton />

      <h2 className={styles.title}>
        {loading
          ? "Đang tìm kiếm…"
          : `Có ${results.length} kết quả cho: `}
        {!loading && <span>{keyword}</span>}
      </h2>

      <div className={styles.grid}>
        {results.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {!loading && results.length === 0 && keyword && (
        <p className={styles.empty}>Không tìm thấy sản phẩm phù hợp.</p>
      )}
    </div>
  );
}
