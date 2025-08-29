"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./PromotionCard";
import CountdownTimer from "./CountDown";
import styles from "../css/PromotionList.module.css";
import ButtonFromIntro from "../css/IntroSlider.module.css";
import { fetchProducts } from "../../lib/productApi";
import { fetchPromotions } from "../../lib/PromoApi";
import ProductCardProps from "../interface/PromotionCard";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 4;

function chunkArray<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr];
  const pages: T[][] = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
}

export default function ProductListSlider() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, promoData] = await Promise.all([
          fetchProducts(),
          fetchPromotions(),
        ]);

        const parentIds = new Set<number>();

        // gom các id sản phẩm có khuyến mãi
        Object.values(promoData).forEach((promo: any) => {
          if (promo.type === "variant") {
            parentIds.add(promo.parentProduct);
          } else if (promo.type === "product") {
            const matchedProduct = productData.find(
              (p: any) => p.id === promo.productId
            );
            if (matchedProduct) parentIds.add(matchedProduct.id);
          }
        });

        const filteredProducts = productData.filter((p: any) =>
          parentIds.has(p.id)
        );

        const enriched: ProductCardProps[] = filteredProducts.map(
          (product: any) => {
            const matchingPromo = Object.values(promoData).find(
              (promo: any) => {
                if (promo.type === "variant")
                  return promo.parentProduct === product.id;
                if (promo.type === "product")
                  return promo.productId === product.id;
                return false;
              }
            );

            let promotionLabel = "";
            const cond = matchingPromo?.conditions;
            if (cond) {
              if (cond.type === "discount") {
                if (cond.discountType === "percentage") {
                  promotionLabel = `Giảm ${cond.value}%`;
                } else if (cond.discountType === "fixed_amount") {
                  promotionLabel = `Giảm ${Number(
                    cond.value
                  ).toLocaleString()}đ`;
                }
              } else if (cond.type === "buy_get") {
                promotionLabel = `Mua ${cond.buyQuantity} tặng ${cond.getQuantity}`;
              }
            }

            const variants = product.variants || [];

            return {
              id: product.id,
              slug: product.slug ?? "",
              name: product.name ?? "",
              image: product.image ?? "",
              price: product.price ?? 0,
              originalPrice: product.originalPrice ?? 0,
              sold: product.sold ?? product.sold_count ?? 0,
              discount: product.discount ?? 0,
              average_rating: product.average_rating ?? 0,
              promotionName: matchingPromo?.promotionName,
              endDate: matchingPromo?.endDate,
              promotionLabel,
              variants,
            };
          }
        );

        setProducts(enriched);
        setPage(0);
      } catch (err) {
        console.error("Lỗi khi fetch:", err);
      }
    };

    fetchData();
  }, []);

  // Tạo các trang để render tất cả slides cùng lúc
  const pages = useMemo(() => chunkArray(products, ITEMS_PER_PAGE), [products]);
  const totalPages = pages.length || 1;

  const next = () => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : 0));
  const prev = () =>
    setPage((prev) => (prev - 1 >= 0 ? prev - 1 : totalPages - 1));

  const currentPageItems = pages[page] ?? [];
  const currentPromoName = currentPageItems[0]?.promotionName;
  const currentEndDate = currentPageItems[0]?.endDate;

  // Tránh NaN khi totalPages = 0 (dù đã fallback = 1)
  const trackWidthPct = Math.max(totalPages, 1) * 100;
  const translatePct = (100 / Math.max(totalPages, 1)) * page;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Sản phẩm khuyến mãi</h2>

      {products.length === 0 ? (
        <h2 className={styles.noPromo}>
          Hiện chưa có khuyến mãi, hẹn gặp lại quý khách!
        </h2>
      ) : (
        <>
          <div className={styles.promoContainer}>
            {currentPromoName && (
              <p className={styles.promoName}>{currentPromoName}</p>
            )}
            {currentEndDate && <CountdownTimer targetDate={currentEndDate} />}
          </div>

          <div className={styles.sliderContainer}>
            <div
              className={styles.sliderTrack}
              style={{
                width: `${trackWidthPct}%`,
                transform: `translateX(-${translatePct}%)`,
                transition: "transform 0.5s ease-in-out",
                display: "flex",
                willChange: "transform",
              }}
            >
              {pages.map((pageItems, idx) => (
                <div
                  key={`page-${idx}`}
                  className={`${styles.slide} ${styles.slidePage ?? ""}`}
                  // KHÔNG dùng shorthand flex để tránh cảnh báo
                  style={{
                    flexGrow: 0,
                    flexShrink: 0,
                    flexBasis: `${100 / Math.max(totalPages, 1)}%`,
                  }}
                >
                  <div className={styles.grid}>
                    {pageItems.map((p) => (
                      <ProductCard
                        key={p.id}
                        id={p.id}
                        slug={p.slug}
                        name={p.name}
                        price={p.price}
                        originalPrice={p.originalPrice}
                        image={p.image}
                        sold={p.sold}
                        discount={p.discount}
                        average_rating={p.average_rating}
                        promotionName={p.promotionName}
                        endDate={p.endDate}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.arrow}
              onClick={prev}
              disabled={pages.length <= 1}
            >
              ◀
            </button>
            <button
              className={ButtonFromIntro.button}
              onClick={() => router.push("/promotion")}
            >
              Xem thêm
            </button>
            <button
              className={styles.arrow}
              onClick={next}
              disabled={pages.length <= 1}
            >
              ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
