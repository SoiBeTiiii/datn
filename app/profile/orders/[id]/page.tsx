"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import baseAxios from "../../../../lib/baseAxios";
import styles from "./orderDetail.module.css";
import { OrderDetailResponse } from "../../../interface/order";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // rating/ảnh tạm theo từng order_detail_id
  const [productsRating, setProductsRating] = useState<Record<number, number>>({});
  const [filesByItem, setFilesByItem] = useState<Record<number, File[]>>({});
  const [previewsByItem, setPreviewsByItem] = useState<Record<number, string[]>>({});
  const [isEditingByItem, setIsEditingByItem] = useState<Record<number, boolean>>({});

  const handleSelectImages = (detailId: number, fileList: FileList | null) => {
    if (!fileList?.length) return;
    const incoming = Array.from(fileList).filter((f) => /^image\//.test(f.type));
    setFilesByItem((prev) => ({ ...prev, [detailId]: [...(prev[detailId] || []), ...incoming] }));
    setPreviewsByItem((prev) => ({
      ...prev,
      [detailId]: [
        ...(prev[detailId] || []),
        ...incoming.map((f) => URL.createObjectURL(f)),
      ],
    }));
  };

  const handleRemoveImage = (detailId: number, idx: number) => {
    const files = filesByItem[detailId] || [];
    const previews = previewsByItem[detailId] || [];
    URL.revokeObjectURL(previews[idx]);
    setFilesByItem((p) => ({ ...p, [detailId]: files.filter((_, i) => i !== idx) }));
    setPreviewsByItem((p) => ({ ...p, [detailId]: previews.filter((_, i) => i !== idx) }));
  };

  const clearTempImages = (detailId: number) => {
    (previewsByItem[detailId] || []).forEach(URL.revokeObjectURL);
    setFilesByItem((p) => ({ ...p, [detailId]: [] }));
    setPreviewsByItem((p) => ({ ...p, [detailId]: [] }));
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await baseAxios.get<{ data: OrderDetailResponse }>(`/user/orders/${id}`);
        setOrder(res.data.data);
      } catch (err) {
        console.error(err);
        toast.error("Không tải được chi tiết đơn hàng.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading || !order) return <p>Đang tải đơn hàng...</p>;

  // helpers
  const validateAndBuildFormData = (
    detailId: number,
    ratingNum: number,
    commentVal: string
  ) => {
    if (ratingNum < 1 || ratingNum > 5) {
      toast.warn("Vui lòng chọn số sao (1–5)");
      const starEl = document.getElementById(`star-${detailId}`);
      starEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return null;
    }
    const fd = new FormData();
    fd.append("rating", String(ratingNum));               // bắt buộc
    if (commentVal) fd.append("comment", commentVal);     // optional
    const files = filesByItem[detailId] || [];
    files.forEach((f) => fd.append("images[]", f));       // optional
    return fd;
  };

  return (
    <div className={styles.container}>
      <ToastContainer position="top-right" autoClose={2000} theme="colored" />

      <h1>Chi tiết đơn hàng #{order.unique_id}</h1>
      <p>Trạng thái: {order.display_status}</p>
      <p>Tổng tiền: {order.total_price.toLocaleString()}₫</p>
      <p>Địa chỉ giao: {order.address}</p>
      <p>Người nhận: {order.shipping_name} - {order.shipping_phone}</p>
      <p>Phương thức thanh toán: {order.payment_method}</p>

      <hr />

      <h2>Sản phẩm</h2>
      {order.products.map((item) => {
        const isEditing = !!isEditingByItem[item.order_detail_id];

        const openEdit = () => {
          setProductsRating((p) => ({ ...p, [item.order_detail_id]: item.review?.rating ?? 0 }));
          setIsEditingByItem((p) => ({ ...p, [item.order_detail_id]: true }));
        };
        const closeEdit = () => {
          setIsEditingByItem(({ [item.order_detail_id]: _, ...rest }) => rest);
          clearTempImages(item.order_detail_id);
        };

        return (
          <div key={item.order_detail_id} className={styles.productCard}>
            <img src={item.image} alt={item.name} className={styles.thumbnail} />
            <div>
              <p><strong>{item.name}</strong></p>
              <p>{item.variant}</p>
              <p>Số lượng: {item.quantity}</p>
              <p>Giá: {item.price.toLocaleString()}₫</p>

              {/* ====== TẠO MỚI REVIEW ====== */}
              {order.can_review && !item.review && (
                <form
                  className={styles.reviewForm}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget as HTMLFormElement;
                    const ratingNum = productsRating[item.order_detail_id] ?? 0;
                    const commentVal =
                      (form.elements.namedItem("comment") as HTMLInputElement | null)?.value?.trim() ?? "";

                    const fd = validateAndBuildFormData(item.order_detail_id, ratingNum, commentVal);
                    if (!fd) return;

                    // tạo mới cần kèm order_detail_id
                    fd.append("order_detail_id", String(item.order_detail_id));
                    try {
                      await baseAxios.post("/user/reviews", fd, {
                        headers: { "Content-Type": "multipart/form-data" },
                      });
                      clearTempImages(item.order_detail_id);
                      toast.success("Đánh giá thành công!");
                      setTimeout(() => location.reload(), 800);
                    } catch (err) {
                      console.error(err);
                      toast.error("Có lỗi khi gửi đánh giá. Vui lòng thử lại.");
                    }
                  }}
                >
                  <div id={`star-${item.order_detail_id}`} className={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${styles.star} ${(productsRating[item.order_detail_id] || 0) >= star ? styles.active : ""}`}
                        onClick={() => setProductsRating((p) => ({ ...p, [item.order_detail_id]: star }))}
                        role="button"
                        aria-label={`Chọn ${star} sao`}
                        tabIndex={0}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter" || ev.key === " ") {
                            setProductsRating((p) => ({ ...p, [item.order_detail_id]: star }));
                          }
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  {/* Hidden rating (không required) */}
                  <input type="hidden" name="rating" value={productsRating[item.order_detail_id] || ""} />

                  <label className={styles.fieldRow}>
                    Bình luận:
                    <input type="text" name="comment" placeholder="Nhận xét (tuỳ chọn)" />
                  </label>

                  <label className={styles.fieldRow}>
                    Ảnh đánh giá:
                    <input
                      type="file"
                      name="images"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleSelectImages(item.order_detail_id, e.target.files)}
                    />
                  </label>

                  {(previewsByItem[item.order_detail_id] || []).length > 0 && (
                    <div className={styles.previewGrid}>
                      {previewsByItem[item.order_detail_id]!.map((src, idx) => (
                        <div key={src} className={styles.previewItem}>
                          <img src={src} className={styles.previewImg} alt={`preview-${idx}`} />
                          <button type="button" className={styles.removeBtn}
                            onClick={() => handleRemoveImage(item.order_detail_id, idx)}
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

              {/* ====== ĐÃ CÓ REVIEW (XEM / CẬP NHẬT) ====== */}
              {item.review && (
                <div className={styles.reviewBox}>
                  {!isEditing ? (
                    <>
                      <p>Đánh giá: ⭐ {item.review.rating}</p>
                      <p>{item.review.comment}</p>

                      {item.review.can_update && (
                        <button type="button" className={styles.updateReviewButton} onClick={openEdit}>
                          Cập nhật đánh giá
                        </button>
                      )}
                    </>
                  ) : (
                    <form
                      className={styles.reviewForm}
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.currentTarget as HTMLFormElement;
                        const ratingNum = productsRating[item.order_detail_id] ?? 0;
                        const commentVal =
                          (form.elements.namedItem("comment") as HTMLInputElement | null)?.value?.trim() ?? "";

                        const fd = validateAndBuildFormData(item.order_detail_id, ratingNum, commentVal);
                        if (!fd) return;

                        try {
                          // Update: POST /user/reviews/:reviewId
                          await baseAxios.post(`/user/reviews/${item.review!.id}`, fd, {
                            headers: { "Content-Type": "multipart/form-data" },
                          });
                          clearTempImages(item.order_detail_id);
                          toast.success("Cập nhật đánh giá thành công!");
                          setTimeout(() => location.reload(), 800);
                        } catch (err) {
                          console.error(err);
                          toast.error("Không thể cập nhật đánh giá. Vui lòng thử lại.");
                        }
                      }}
                    >
                      <div id={`star-${item.order_detail_id}`} className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`${styles.star} ${(productsRating[item.order_detail_id] || 0) >= star ? styles.active : ""}`}
                            onClick={() => setProductsRating((p) => ({ ...p, [item.order_detail_id]: star }))}
                            role="button"
                            aria-label={`Chọn ${star} sao`}
                            tabIndex={0}
                            onKeyDown={(ev) => {
                              if (ev.key === "Enter" || ev.key === " ") {
                                setProductsRating((p) => ({ ...p, [item.order_detail_id]: star }));
                              }
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <label className={styles.fieldRow}>
                        Bình luận:
                        <input
                          type="text"
                          name="comment"
                          defaultValue={item.review?.comment ?? ""}
                          placeholder="Nhận xét (tuỳ chọn)"
                        />
                      </label>

                      <label className={styles.fieldRow}>
                        Ảnh đánh giá (tuỳ chọn):
                        <input
                          type="file"
                          name="images"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleSelectImages(item.order_detail_id, e.target.files)}
                        />
                      </label>

                      {(previewsByItem[item.order_detail_id] || []).length > 0 && (
                        <div className={styles.previewGrid}>
                          {previewsByItem[item.order_detail_id]!.map((src, idx) => (
                            <div key={src} className={styles.previewItem}>
                              <img src={src} className={styles.previewImg} alt={`preview-${idx}`} />
                              <button type="button" className={styles.removeBtn}
                                onClick={() => handleRemoveImage(item.order_detail_id, idx)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className={styles.buttonRow}>
                        <button type="submit" className={styles.submitReviewButton}>Lưu cập nhật</button>
                        <button type="button" className={styles.cancelButton} onClick={closeEdit}>Hủy</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
