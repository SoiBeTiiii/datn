'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ ĐÚNG cho App Router
import styles from "./orders.module.css";
import { Order } from "../../interface/order";

import {
  getOrderByStatus,
  repayOrderApi,
  requestReturnApi,
} from "../../../lib/orderHistoryApi";
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
  const [canceling, setCanceling] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState<string | null>(null); // unique_id của đơn đang hủy
  const [cancelReason, setCancelReason] = useState<string>("");
  const [showReturnForm, setShowReturnForm] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState<string>("");
  const [returning, setReturning] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null); // Popup form thanh toán
  const [paymentMethod, setPaymentMethod] = useState<string>("MOMO"); // Phương thức thanh toán mặc định

  const handleRepay = async (unique_id: string, method: string) => {
    try {
      const redirectUrl = await repayOrderApi(unique_id, method);
      if (redirectUrl) {
        window.location.href = redirectUrl; // Chuyển hướng đến trang thanh toán
      } else {
        alert("Không nhận được liên kết thanh toán");
      }
    } catch (error) {
      console.error(error);
      alert("Thanh toán lại thất bại");
    }
  };

  const handleReturnRequest = async (order_id: string, reason: string) => {
    try {
      setReturning(true);
      await requestReturnApi(order_id, reason);
      alert("Yêu cầu trả hàng đã được gửi");

      const data = await getOrderByStatus("returned");
      setOrders(data);
      setShowReturnForm(null);
      setReturnReason("");
    } catch (error) {
      console.error(error);
      alert("Gửi yêu cầu trả hàng thất bại");
    } finally {
      setReturning(false);
    }
  };

  const cancelOrder = async (unique_id: string, reason: string) => {
    try {
      setCanceling(true);
      await cancelOrderApi(unique_id, reason); // Truyền lý do hủy vào API
      alert("Đã hủy đơn hàng");

      const data = await getOrderByStatus("cancelled");
      setOrders(data);
      setShowCancelForm(null);
      setCancelReason("");
    } catch (error) {
      console.error(error);
      alert("Hủy đơn hàng thất bại");
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const statusParam = reverseStatusTabMap[activeTab];
        const data = await getOrderByStatus(statusParam);
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
            className={`${styles.tabButton} ${activeTab === tab ? styles.active : ""}`}
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
              <p>Tổng tiền: {order.total_price.toLocaleString()}₫</p>
              <p>Phương thức thanh toán: {order.payment_method}</p>
              <ul className={styles.ulList}>
                {order.products.map((p, idx) => (
                  <li key={idx}>
                    {p.name} ({p.variant}) - SL: {p.quantity}
                    {p.is_gift && <span> 🎁 {p.is_gift_text}</span>}
                  </li>
                ))}
              </ul>

              <div className={styles.actions}>
                {["ordered", "confirmed", "shipping"].includes(order.status) && order.can_cancel && (
                  <>
                    {/* Ẩn nút khi form thanh toán lại được hiển thị */}
                    {showPaymentForm !== order.unique_id && order.can_pay && (
                      <button
                        className={styles.actionButton}
                        onClick={() => setShowPaymentForm(order.unique_id)} // Hiển thị form thanh toán lại
                      >
                        Thanh toán lại
                      </button>
                    )}

                    {/* Popup thanh toán lại */}
                    {showPaymentForm === order.unique_id && (
                      <div className={styles.popupOverlay}>
                        <div className={styles.popup}>
                          <h3>Chọn phương thức thanh toán:</h3>
                          <select
                            className={styles.select}
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                          >
                            <option className={styles.option} value="MOMO">MOMO</option>
                            <option className={styles.option} value="VNPAY">VNPAY</option>
                            <option className={styles.option} value="COD">COD</option>
                          </select>
                          <button
                            className={styles.confirmButton}
                            onClick={() => handleRepay(order.unique_id, paymentMethod)}
                          >
                            Xác nhận thanh toán lại
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => setShowPaymentForm(null)} // Đóng form
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Form hủy đơn */}
                    {showCancelForm === order.unique_id ? (
                      <div className={styles.popupOverlay}>
                        <div className={styles.popup}>
                          <textarea
                            placeholder="Lý do hủy đơn..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className={styles.textarea}
                          />
                          <button
                            className={styles.confirmCancelButton}
                            onClick={() => cancelOrder(order.unique_id, cancelReason)}
                            disabled={canceling || !cancelReason.trim()}
                          >
                            {canceling ? "Đang xử lý..." : "Xác nhận hủy"}
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => {
                              setShowCancelForm(null);
                              setCancelReason("");
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={styles.actionButton}
                        onClick={() => setShowCancelForm(order.unique_id)}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </>
                )}

                {/* Nút "Xem chi tiết" */}
                <button
                  className={styles.actionButton}
                  onClick={() => router.push(`/profile/orders/${order.unique_id}`)}
                >
                  Xem chi tiết
                </button>

                {/* Xử lý trả hàng */}
                {order.can_request_return && (
                  <>
                    {showReturnForm === order.unique_id ? (
                      <div className={styles.popupOverlay}>
                        <div className={styles.popup}>
                          <textarea
                            placeholder="Lý do trả hàng..."
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            className={styles.textarea}
                          />
                          <button
                            className={styles.confirmCancelButton}
                            onClick={() => handleReturnRequest(order.unique_id, returnReason)}
                            disabled={returning || !returnReason.trim()}
                          >
                            {returning ? "Đang xử lý..." : "Xác nhận trả hàng"}
                          </button>
                          <button
                            className={styles.cancelButton}
                            onClick={() => {
                              setShowReturnForm(null);
                              setReturnReason("");
                            }}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className={styles.actionButton}
                        onClick={() => setShowReturnForm(order.unique_id)}
                      >
                        Trả hàng
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
