// services/orderHistoryApi.ts
import baseAxios from './baseAxios'; // đã có sẵn theo bạn nói
import { Order } from '../app/interface/order';



export const getOrderByStatus = async (status: string, currentPage: number, ordersPerPage: number): Promise<Order[]> => {
  const res = await baseAxios.get<{ data: Order[] }>(
    '/user/orders',
    {
      params: { status },
    }
  );
  return res.data.data;
};

export const cancelOrderApi = async (orderId: string) => {
  return await baseAxios.post(`/user/orders?status=cancelled`);
};

