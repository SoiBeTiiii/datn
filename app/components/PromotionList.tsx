"use client";

import { useEffect, useState } from "react";
import ProductCard from "./PromotionCard";
import CountdownTimer from "./CountDown";

import styles from "../css/PromotionList.module.css";
import ButtonFromIntro from "../css/IntroSlider.module.css";

import { fetchProducts } from "../../lib/productApi";
import { fetchPromotions } from "../../lib/PromoApi";
import ProductCardProps from "../interface/PromotionCard";

export default function ProductListSlider() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(0);
  const ITEMS_PER_PAGE = 4;

useEffect(() => {
  const fetchData = async () => {
    try {
      const [productData, promoData] = await Promise.all([
        fetchProducts(),
        fetchPromotions(),
      ]);

      const parentIds = new Set<number>();

      // Xử lý khuyến mãi
      Object.values(promoData).forEach((promo: any) => {
        if (promo.type === "variant") {
          parentIds.add(promo.parentProduct);
        } else if (promo.type === "product") {
          // Xử lý type product: Kiểm tra productId trong promoData với các sản phẩm trong productData
          const matchedProduct = productData.find(
            (product: any) => product.id === promo.productId
          );
          if (matchedProduct) {
            parentIds.add(matchedProduct.id);
          }
        }
      });

      // Lọc các sản phẩm theo parentIds
      const filteredProducts = productData.filter((product: any) =>
        parentIds.has(product.id)
      );

      // Làm giàu thông tin cho các sản phẩm đã lọc
      const enriched = filteredProducts.map((product: any) => {
        const matchingPromo = Object.values(promoData).find((promo: any) => {
          if (promo.type === "variant") {
            return promo.parentProduct === product.id;
          } else if (promo.type === "product") {
            return promo.productId === product.id; // So khớp productId của khuyến mãi với sản phẩm
          }
          return false;
        });

        // Tạo label từ condition
        let promotionLabel = "";
        const cond = matchingPromo?.conditions;
        if (cond) {
          if (cond.type === "discount") {
            if (cond.discountType === "percentage") {
              promotionLabel = `Giảm ${cond.value}%`;
            } else if (cond.discountType === "fixed_amount") {
              promotionLabel = `Giảm ${Number(cond.value).toLocaleString()}đ`;
            }
          } else if (cond.type === "buy_get") {
            promotionLabel = `Mua ${cond.buyQuantity} tặng ${cond.getQuantity}`;
          }
        }

        // Lấy tất cả các biến thể của sản phẩm
        const variants = product.variants || [];

        return {
          ...product,
          promotionName: matchingPromo?.promotionName,
          endDate: matchingPromo?.endDate,
          sold:
            matchingPromo && "soldQuantity" in matchingPromo
              ? matchingPromo.soldQuantity
              : product.sold,
          promotionLabel,
          variants, // Thêm biến thể của sản phẩm vào kết quả
        };
      });

      setProducts(enriched); // Cập nhật sản phẩm đã làm giàu
    } catch (err) {
      console.error("Lỗi khi fetch:", err);
    }
  };

  fetchData();
}, []);


  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const next = () => setPage((prev) => (prev + 1) % totalPages);
  const prev = () => setPage((prev) => (prev - 1 + totalPages) % totalPages);

  const visibleProducts = products.slice(
    page * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Sản phẩm khuyến mãi</h2>
      <div className={styles.promoContainer}>
        {visibleProducts[0]?.promotionName && (
          <p className={styles.promoName}>{visibleProducts[0].promotionName}</p>
        )}
        {visibleProducts[0]?.endDate && (
          <CountdownTimer targetDate={visibleProducts[0].endDate} />
        )}
      </div>
      <div className={styles.grid}>
        {visibleProducts.map((p) => (
          <ProductCard
            key={p.id}
            id={p.id}
            slug={p.slug ?? ""}
            name={p.name ?? ""}
            price={p.price ?? 0}
            originalPrice={p.originalPrice ?? 0}
            image={p.image ?? ""}
            sold={p.sold ?? 0}
            discount={p.discount ?? 0}
            average_rating={p.average_rating ?? 0}
            promotionName={p.promotionName}
            endDate={p.endDate}
          />
        ))}
      </div>

      <div className={styles.controls}>
        <button className={styles.arrow} onClick={prev}>
          ←
        </button>
        <button className={ButtonFromIntro.button}>Xem thêm</button>
        <button className={styles.arrow} onClick={next}>
          →
        </button>
      </div>
    </div>
  );
}
