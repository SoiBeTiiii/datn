'use client';

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
    const [productsRating, setProductsRating] = useState<{ [key: number]: number }>({});

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                const res = await baseAxios.get<OrderDetailResponse>(`/user/orders/${id}`);
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
            <p>Trạng thái: {order.status}</p>
            <p>Tổng tiền: {(order.total_price / 1000).toLocaleString()}₫</p>
            <p>Địa chỉ giao: {order.address}</p>
            <p>Người nhận: {order.shipping_name} - {order.shipping_phone}</p>
            <p>Phương thức thanh toán: {order.payment_method}</p>

            <hr />

            <h2>Sản phẩm</h2>
            {order.products.map((item) => {
                const tempRating = productsRating[item.order_detail_id] || 0;

                return (
                    <div key={item.order_detail_id} className={styles.productCard}>
                        <img src={item.image} alt={item.name} className={styles.thumbnail} />
                        <div>
                            <p><strong>{item.name}</strong></p>
                            <p>{item.variant}</p>
                            <p>Số lượng: {item.quantity}</p>
                            <p>Giá: {(item.price / 1000).toLocaleString()}₫</p>

                            {order.can_review && !item.review && (
                                <form
                                    className={styles.reviewForm}
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const rating = form.rating.value;
                                        const comment = form.comment.value;
                                        const image = form.image.files[0];

                                        if (!rating) return alert("Vui lòng chọn số sao");

                                        const formData = new FormData();
                                        formData.append("order_detail_id", String(item.order_detail_id));
                                        formData.append("rating", rating);
                                        formData.append("comment", comment);
                                        if (image) formData.append("images[]", image);

                                        try {
                                            await baseAxios.post("/user/reviews", formData, {
                                                headers: { "Content-Type": "multipart/form-data" },
                                            });
                                            alert("Đánh giá thành công!");
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
                                                className={`${styles.star} ${tempRating >= star ? styles.active : ""}`}
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
                                    <input type="hidden" name="rating" value={tempRating} required />

                                    <label>
                                        Bình luận:
                                        <input type="text" name="comment" placeholder="Nhận xét (tuỳ chọn)" />
                                    </label>

                                    <label>
                                        Ảnh đánh giá:
                                        <input type="file" name="image" accept="image/*" />
                                    </label>

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
