"use client";
import styles from "./productDetail.module.css";
import ProductCard from "../../components/ProductCard";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  fetchProductBySlug,
  fetchReviewsByProductSlug,
} from "../../../lib/productApi";
import { ProductDetail, Review } from "@/app/interface/ProductDetail";
import CountdownTimer from "../../components/CountDown";
import { useCart } from "../../context/CartConText";
import { toast } from "react-toastify";
export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{
    [key: string]: string;
  }>({});
  const { addToCart } = useCart();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalSlides = Math.ceil((product?.related?.length || 0) / itemsPerPage);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth >= 1400) setItemsPerPage(5);
      else if (window.innerWidth >= 1024) setItemsPerPage(4);
      else if (window.innerWidth >= 768) setItemsPerPage(3);
      else if (window.innerWidth >= 480) setItemsPerPage(2);
      else setItemsPerPage(1);
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  const handleNext = () => {
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Build maps from option values
  const buildVariantOptions = (product: ProductDetail) => {
    const idToLabelMap: Record<string | number, string> = {};

    product.options.forEach((opt) => {
      opt.value_ids.forEach((id, idx) => {
        idToLabelMap[id] = opt.value_labels[idx];
      });
    });

    product.variants.forEach((variant) => {
      variant.options = variant.option_value_ids.map((id) => {
        const option = product.options.find((opt) =>
          opt.value_ids.includes(id)
        );
        return {
          name: option?.name || "Không rõ",
          value: idToLabelMap[id] || id.toString(),
        };
      });
    });
  };

  const normalizeVariants = (
    product: ProductDetail,
    valueIdToLabel: Record<string | number, string>,
    valueIdToOptionName: Record<string | number, string>
  ) => {
    if (!product.variants) return [];

    return product.variants.map((variant) => {
      const options = variant.option_value_ids.map((valueId) => ({
        name: valueIdToOptionName[valueId],
        value: valueIdToLabel[valueId],
      }));

      return { ...variant, options };
    });
  };

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await fetchProductBySlug(slug as string);
        const reviewsResponse = await fetchReviewsByProductSlug(slug as string);

        if (isMounted) {
          if (res) {
            buildVariantOptions(res);
            setProduct(res);
            setSelectedOptions({});
            setSelectedVariant(null);
            setSelectedImage(res.image);
          }
          setReviews(reviewsResponse);
        }
      } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleOptionSelect = (name: string, value: string) => {
    const newOptions = { ...selectedOptions, [name]: value };
    setSelectedOptions(newOptions);

    const matched = product?.variants.find(
      (variant) =>
        Array.isArray(variant.options) &&
        variant.options.every((opt) => newOptions[opt.name] === opt.value)
    );

    setSelectedVariant(matched || null);
    if (matched?.image) setSelectedImage(matched.image);
  };

  if (!product) return <p>Đang tải sản phẩm...</p>;

  const price =
    selectedVariant?.final_price_discount ??
    selectedVariant?.sale_price ??
    selectedVariant?.price ??
    0;

  return (
    <>
      <main className={styles["product-container"]}>
        <section className={styles["product-gallery"]}>
          <figure>
            <img
              src={selectedImage || product.image}
              className={styles["main-image"]}
              alt={product.name}
            />

            <figcaption className={styles["thumbnails"]}>
              <img
                src={product.image}
                alt="thumb-main"
                className={styles["thumbnail"]}
                onClick={() => setSelectedImage(product.image)}
              />

              {product.variants.map((v, idx) =>
                v.image ? (
                  <img
                    key={idx}
                    src={v.image}
                    alt={`thumb-${idx}`}
                    className={styles["thumbnail"]}
                    onClick={() => setSelectedImage(v.image || product.image)}
                  />
                ) : null
              )}
            </figcaption>
          </figure>
        </section>

        <section className={styles["product-info"]}>
          <header>
            <div className={styles["brand"]}>{product.brand}</div>
            <h1 className={styles["product-name"]}>{product.name}</h1>
            <div className={styles["rating"]}>
              {"★".repeat(Math.round(product.average_rating)) +
                "☆".repeat(5 - Math.round(product.average_rating))}{" "}
              <span>({product.review_count} đánh giá)</span>
            </div>
            <div className={styles["sku"]}>
              Tình trạng:{" "}
              <span className={styles["in-stock"]}>
                {selectedVariant?.quantity > 0 ? "Còn hàng" : "Hết hàng"}{" "}
              </span>{" "}
              | Mã SKU:{" "}
              <span className={styles["sku-value"]}>
                {selectedVariant?.sku || "—"}
              </span>
            </div>
          </header>

          {/* Option Selector */}
          {product.options.map((option) => (
            <div key={option.id} className={styles["option-group"]}>
              <label className={styles["option-label"]}>{option.name}:</label>
              <div className={styles["option-values"]}>
                {option.value_ids.map((valueId, idx) => {
                  const valueLabel = option.value_labels[idx];
                  const isSelected =
                    selectedOptions[option.name] === valueLabel;

                  return (
                    <button
                      key={valueId}
                      className={`${styles["option-button"]} ${
                        isSelected ? styles["selected"] : ""
                      }`}
                      onClick={() =>
                        handleOptionSelect(option.name, valueLabel)
                      }
                    >
                      <span>{valueLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className={styles["price"]}>
            {selectedVariant ? (
              <>
                <strong>{price.toLocaleString()}₫</strong>
                <span className={styles["old-price"]}>
                  {selectedVariant.price.toLocaleString()}₫
                </span>
                <span className={styles["discount"]}>
                  -{Math.round(100 - (price * 100) / selectedVariant.price)}%
                </span>
                <div className={styles["save"]}>
                  (Tiết kiệm: {(selectedVariant.price - price).toLocaleString()}
                  ₫)
                </div>
              </>
            ) : (
              <strong>Vui lòng chọn phân loại</strong>
            )}
          </div>

          {(selectedVariant?.promotion?.endDate ||
            product?.promotion?.endDate) && (
            <div className={styles["countdown-wrapper"]}>
              <p className={styles["countdown-title"]}>
                ⏰ Khuyến mãi kết thúc sau:
              </p>
              <CountdownTimer
                targetDate={
                  selectedVariant?.promotion?.endDate ||
                  product?.promotion?.endDate
                }
              />
            </div>
          )}

          <div className={styles["quantity"]}>
            <label htmlFor="quantity-input">Số lượng:</label>
            <button
              aria-label="Giảm số lượng"
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
            >
              -
            </button>
            <input
              id="quantity-input"
              type="text"
              value={quantity}
              readOnly
              max={selectedVariant?.quantity}
            />{" "}
            <button
              aria-label="Tăng số lượng"
              onClick={() =>
                setQuantity((prev) =>
                  selectedVariant
                    ? Math.min(prev + 1, selectedVariant.quantity)
                    : prev + 1
                )
              }
              disabled={
                selectedVariant ? quantity >= selectedVariant.quantity : false
              }
            >
              +
            </button>
          </div>

          <div className={styles["actions"]}>
            <button className={styles["buy-now"]}>Mua ngay</button>
            <button
              className={styles["add-cart"]}
              disabled={!selectedVariant}
              onClick={() => {
                if (!selectedVariant) return;

                addToCart({
                  productId: product.id,
                  id: product.id,
                  name: product.name,
                  image: product.image,
                  price: price,
                  variantId: selectedVariant.id,
                  quantity: quantity,
                  options: selectedVariant.options.reduce(
                    (acc: any, opt: any) => {
                      acc[opt.name] = { name: opt.name, value: opt.value };
                      return acc;
                    },
                    {}
                  ),
                  final_price_discount: undefined,
                  sale_price: null,
                  promotion: undefined,
                  originalPrice: 0,
                  discount: 0,
                });

                toast.success("🎉 Đã thêm vào giỏ hàng!", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                });
              }}
            >
              Thêm vào giỏ
            </button>
          </div>
          <ul className={styles["features"]}>
            <li>🚚 Giao hàng toàn quốc</li>
            <li>🎁 Tích điểm tất cả sản phẩm</li>
            <li>💸 Giảm giá trên mỗi đơn hàng</li>
            <li>🔒 Cam kết chính hãng</li>
          </ul>
        </section>
      </main>

      <section className={styles["product-details"]}>
        <h2 className={styles["tab-title"]}>Thông tin sản phẩm</h2>
        <article className={styles["tab-content"]}>
          <h3>{product.name}</h3>
          <p>{product.description || "Đang cập nhật mô tả sản phẩm..."}</p>
        </article>
      </section>

      <section className={styles["review-section"]}>
        <h2>Đánh giá sản phẩm</h2>

        {reviews.length === 0 ? (
          <p>Chưa có đánh giá nào cho sản phẩm này.</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={styles["review"]}>
              <div className={styles["review-header"]}>
                <img
                  src={
                    review.user.image ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={review.user.name}
                  className={styles["review-avatar"]}
                />
                <div>
                  <strong>
                    {review.is_anonymous
                      ? review.user.name.replace(/.(?=.{2})/g, "*")
                      : review.user.name}
                  </strong>
                  <div className={styles["stars"]}>
                    {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                  </div>
                </div>
                <div className={styles["review-date"]}>
                  {new Date(review.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <p className={styles["review-comment"]}>{review.comment}</p>

              {review.images.length > 0 && (
                <div className={styles["review-images"]}>
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`review-${idx}`}
                      className={styles["review-image"]}
                    />
                  ))}
                </div>
              )}

              {review.reply && (
                <div className={styles["review-reply"]}>
                  <strong>
                    Phản hồi từ{" "}
                    {review.reply.user.role === "admin"
                      ? "admin"
                      : "người dùng"}
                    :
                  </strong>
                  <p>{review.reply.reply}</p>
                  <small>
                    {new Date(review.reply.date).toLocaleDateString("vi-VN")}
                  </small>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section className={styles["related-products"]}>
        <h2>Sản phẩm liên quan</h2>

        <div className={styles["slider-container"]}>
          <button
            className={styles["prev-btn"]}
            onClick={() => handlePrev()}
            disabled={currentIndex === 0}
          >
            &#10094;
          </button>

          <div className={styles["slider-wrapper"]}>
            <div
              className={styles["slider"]}
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage)
                }%)`,
              }}
            >
              {product.related?.map((rel) => (
                <div className={styles["slide"]} key={rel.id}>
                  <ProductCard
                    id={rel.id}
                    slug={rel.slug}
                    name={rel.name}
                    brand={rel.brand}
                    image={rel.image}
                    price={rel.sale_price}
                    originalPrice={rel.price}
                    discount={Math.round(
                      100 - (rel.sale_price * 100) / rel.price
                    )}
                    sold={rel.sold_count}
                    average_rating={rel.average_rating}
                    variants={[]}
                    type={undefined}
                    type_skin={""} is_featured={false}                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className={styles["next-btn"]}
            onClick={() => handleNext()}
            disabled={currentIndex >= totalSlides - 1}
          >
            &#10095;
          </button>
        </div>
      </section>
    </>
  );
}
