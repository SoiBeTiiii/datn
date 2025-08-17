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

export async function repayOrderApi(unique_id: string, payment_method: string, p0: string): Promise<string> {
  const res = await baseAxios.post<RepayResponse>(
    `/user/repay/${unique_id}`,
    { payment_method }
  );
  return res.data.data.redirect_url;
}

export async function requestReturnApi(order_id: string, reason: string) {
  const res = await baseAxios.post(`/user/return-request/${order_id}`, {
    reason,
  });
  return res.data;
}
