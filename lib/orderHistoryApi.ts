// services/orderHistoryApi.ts
import baseAxios from './baseAxios'; // đã có sẵn theo bạn nói
import { Order } from '../app/interface/order';

interface RepayResponse {
  success: boolean;
  message: string;
  code: number;
  data: {
    redirect_url: string;
  };
}


export const getOrderByStatus = async (status: string): Promise<Order[]> => {
  const res = await baseAxios.get<{ data: Order[] }>(
    '/user/orders',
    {
      params: { status },
    }
  );
  return res.data.data;
};

export const cancelOrderApi = async (unique_id: string, reason: string) => {
  return await baseAxios.post(`/user/cancel-orders/${unique_id}`, { reason });
};

// Định nghĩa kiểu dữ liệu phản hồi từ API
interface RepayResponse {
  data: {
    redirect_url: string; // URL để chuyển hướng người dùng sau khi thanh toán
  };
}

// Hàm thanh toán lại đơn hàng
export async function repayOrderApi(
  unique_id: string, // unique_id của đơn hàng cần thanh toán lại
  payment_method: string // Phương thức thanh toán (ví dụ: "MOMO", "VNPAY")
): Promise<string> {
  try {
    // Gửi yêu cầu thanh toán lại tới API với phương thức thanh toán
    const res = await baseAxios.post<RepayResponse>(`/user/repay/${unique_id}`, {
      payment_method, // Chỉ gửi phương thức thanh toán
    });

    // Kiểm tra phản hồi từ API
    if (res.data && res.data.data && res.data.data.redirect_url) {
      // Trả về redirect_url từ API để người dùng có thể chuyển hướng đến trang thanh toán
      return res.data.data.redirect_url;
    } else {
      throw new Error("Không có liên kết thanh toán trả về.");
    }
  } catch (error) {
    // Nếu có lỗi xảy ra khi gọi API, ném lỗi để có thể xử lý ở nơi gọi hàm này
    console.error("Error repaying order:", error);
    throw new Error("Thanh toán lại thất bại. Vui lòng thử lại.");
  }
}


export async function requestReturnApi(order_id: string, reason: string) {
  const res = await baseAxios.post(`/user/return-request/${order_id}`, {
    reason,
  });
  return res.data;
}
