"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ĐÚNG cho App Router
import styles from "./orders.module.css";
import { Order } from "../../interface/order";
import { getOrderByStatus } from "../../../lib/orderHistoryApi";
import { cancelOrderApi } from "../../../lib/orderHistoryApi";

const statusTabMap: Record<string, string> = {
  ordered: "chờ xác nhận",
  confirmed: "đã xác nhận",
  shipping: "đang giao hàng",
  delivered: "đã giao",
  cancelled: "đã hủy",
  returned: "đã trả hàng",
};

const reverseStatusTabMap = Object.entries(statusTabMap).reduce(
  (acc, [k, v]) => {
    acc[v] = k;
    return acc;
  },
  {} as Record<string, string>
);

const tabKeys = Object.values(statusTabMap);

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<string>("chờ xác nhận");
  const [loading, setLoading] = useState<boolean>(false);

  const cancelOrder = async (orderId: string) => {
    try {
      await cancelOrderApi(orderId);
      alert("Đã hủy đơn hàng");

      // Chuyển sang tab "đã hủy"
      const data = await getOrderByStatus("cancelled", 1, 10);
      setOrders(data);
    } catch (error) {
      console.error(error);
      alert("Hủy đơn hàng thất bại");
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const statusParam = reverseStatusTabMap[activeTab];
        const data = await getOrderByStatus(statusParam, 1, 10);
        setOrders(data);
      } catch (error) {
        console.error("Lỗi lấy đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [activeTab]);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Lịch sử đơn hàng</h1>

      <nav className={styles.nav}>
        {tabKeys.map((tab) => (
          <button
            key={tab}
            className={`${styles.tabButton} ${
              activeTab === tab ? styles.active : ""
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.content}>
        {loading ? (
          <p>Đang tải...</p>
        ) : orders.length === 0 ? (
          <p>
            Không có đơn hàng nào ở trạng thái: <strong>{activeTab}</strong>
          </p>
        ) : (
          orders.map((order) => (
            <div key={order.unique_id} className={styles.orderCard}>
              <h3>Mã đơn: {order.unique_id}</h3>
              <p>Trạng thái: {order.status}</p>
              <p>Tổng tiền: {(order.total_price / 1000).toLocaleString()}₫</p>
              <ul className={styles.ulList}>
                {order.products.map((p, idx) => (
                  <li key={idx}>
                    {p.name} ({p.variant}) - SL: {p.quantity}
                    {p.is_gift && <span> 🎁 {p.is_gift_text}</span>}
                  </li>
                ))}
              </ul>

              <div className={styles.actions}>
                {["ordered", "confirmed", "shipping"].includes(order.status) &&
                  order.can_cancel && (
                    <button
                      className={styles.actionButton}
                      onClick={() => cancelOrder(order.unique_id)}
                    >
                      Hủy đơn
                    </button>
                  )}

                {/* Hiển thị nút "Xem chi tiết" cho tất cả trạng thái */}
                <button
                  className={styles.actionButton}
                  onClick={() =>
                    router.push(`/profile/orders/${order.unique_id}`)
                  } // ✅ CHÍNH XÁC
                >
                  Xem chi tiết
                </button>

                {order.status === "delivered" && order.can_review && (
                  <button
                    className={styles.actionButton}
                    onClick={() =>
                      router.push(`/profile/orders/${order.unique_id}`)
                    } // ✅ CHÍNH XÁC
                  >
                    Đánh giá sản phẩm
                  </button>
                )}

                {order.status === "returned" && order.can_request_return && (
                  <button className={styles.actionButton}>Trả hàng</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
