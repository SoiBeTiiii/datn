"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import baseAxios from "../../../../lib/baseAxios";
import styles from "./orderDetail.module.css";
import { OrderDetailResponse } from "../../../interface/order";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [productsRating, setProductsRating] = useState<{
    [key: number]: number;
  }>({});
  const [filesByItem, setFilesByItem] = useState<Record<number, File[]>>({});
  const [previewsByItem, setPreviewsByItem] = useState<
    Record<number, string[]>
  >({});
  const handleSelectImages = (detailId: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    // chỉ lấy file ảnh + (tuỳ chọn) giới hạn số ảnh
    const incoming = Array.from(fileList).filter((f) =>
      /^image\//.test(f.type)
    );
    // gộp với ảnh đã chọn trước đó
    const mergedFiles = [...(filesByItem[detailId] || []), ...incoming];
    const mergedPreviews = [
      ...(previewsByItem[detailId] || []),
      ...incoming.map((f) => URL.createObjectURL(f)),
    ];

    setFilesByItem((prev) => ({ ...prev, [detailId]: mergedFiles }));
    setPreviewsByItem((prev) => ({ ...prev, [detailId]: mergedPreviews }));
  };
  const handleRemoveImage = (detailId: number, idx: number) => {
    const files = filesByItem[detailId] || [];
    const previews = previewsByItem[detailId] || [];
    const nextFiles = files.filter((_, i) => i !== idx);
    const nextPreviews = previews.filter((_, i) => i !== idx);

    // thu hồi objectURL để tránh rò RAM
    URL.revokeObjectURL(previews[idx]);

    setFilesByItem((prev) => ({ ...prev, [detailId]: nextFiles }));
    setPreviewsByItem((prev) => ({ ...prev, [detailId]: nextPreviews }));
  };

  useEffect(() => {
    if (!id) return;

    const fetchOrder = async () => {
      try {
        const res = await baseAxios.get<OrderDetailResponse>(
          `/user/orders/${id}`
        );
        // console.log("🔥 Response từ API chi tiết đơn hàng:", res.data);
        setOrder(res.data.data);
      } catch (err) {
        console.error("Lỗi lấy chi tiết đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading || !order) return <p>Đang tải đơn hàng...</p>;

  return (
    <div className={styles.container}>
      <h1>Chi tiết đơn hàng #{order.unique_id}</h1>
      <p>Trạng thái: {order.display_status}</p>
      <p>Tổng tiền: {order.total_price.toLocaleString()}₫</p>
      <p>Địa chỉ giao: {order.address}</p>
      <p>
        Người nhận: {order.shipping_name} - {order.shipping_phone}
      </p>
      <p>Phương thức thanh toán: {order.payment_method}</p>

      <hr />

      <h2>Sản phẩm</h2>
      {order.products.map((item) => {
        const tempRating = productsRating[item.order_detail_id] || 0;

        return (
          <div key={item.order_detail_id} className={styles.productCard}>
            <img
              src={item.image}
              alt={item.name}
              className={styles.thumbnail}
            />
            <div>
              <p>
                <strong>{item.name}</strong>
              </p>
              <p>{item.variant}</p>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {item.price.toLocaleString()}₫</p>

              {order.can_review && !item.review && (
                <form
                  className={styles.reviewForm}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const rating = (
                      form.elements.namedItem("rating") as HTMLInputElement
                    ).value;
                    const comment = (
                      form.elements.namedItem("comment") as HTMLInputElement
                    ).value;

                    if (!rating) return alert("Vui lòng chọn số sao");

                    const formData = new FormData();
                    formData.append(
                      "order_detail_id",
                      String(item.order_detail_id)
                    );
                    formData.append("rating", rating);
                    formData.append("comment", comment);

                    // ⬇️ append MẢNG ẢNH đúng định dạng API: images[]
                    const files = filesByItem[item.order_detail_id] || [];
                    files.forEach((f) => formData.append("images[]", f));

                    try {
                      await baseAxios.post("/user/reviews", formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      alert("Đánh giá thành công!");
                      // thu hồi preview hiện tại
                      (previewsByItem[item.order_detail_id] || []).forEach(
                        URL.revokeObjectURL
                      );
                      location.reload();
                    } catch (err) {
                      console.error("Lỗi gửi đánh giá:", err);
                      alert("Có lỗi khi gửi đánh giá");
                    }
                  }}
                >
                  <div className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${styles.star} ${
                          (productsRating[item.order_detail_id] || 0) >= star
                            ? styles.active
                            : ""
                        }`}
                        onClick={() =>
                          setProductsRating((prev) => ({
                            ...prev,
                            [item.order_detail_id]: star,
                          }))
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <input
                    type="hidden"
                    name="rating"
                    value={productsRating[item.order_detail_id] || 0}
                    required
                  />

                  <label className={styles.fieldRow}>
                    Bình luận:
                    <input
                      type="text"
                      name="comment"
                      placeholder="Nhận xét (tuỳ chọn)"
                    />
                  </label>

                  {/* ⬇️ Input chọn NHIỀU ảnh + preview */}
                  <label className={styles.fieldRow}>
                    Ảnh đánh giá:
                    <input
                      type="file"
                      name="images" // name input có thể là "images"; khi append dùng "images[]"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleSelectImages(item.order_detail_id, e.target.files)
                      }
                    />
                  </label>

                  {/* PREVIEW ảnh đã chọn */}
                  {(previewsByItem[item.order_detail_id] || []).length > 0 && (
                    <div className={styles.previewGrid}>
                      {previewsByItem[item.order_detail_id]!.map((src, idx) => (
                        <div key={src} className={styles.previewItem}>
                          <img
                            src={src}
                            className={styles.previewImg}
                            alt={`preview-${idx}`}
                          />
                          <button
                            type="button"
                            className={styles.removeBtn}
                            onClick={() =>
                              handleRemoveImage(item.order_detail_id, idx)
                            }
                            aria-label="Xóa ảnh"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button type="submit" className={styles.submitReviewButton}>
                    Gửi đánh giá
                  </button>
                </form>
              )}

              {item.review && (
                <div className={styles.reviewBox}>
                  <p>Đánh giá: ⭐ {item.review.rating}</p>
                  <p>{item.review.comment}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
