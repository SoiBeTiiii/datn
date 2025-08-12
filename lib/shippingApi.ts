// api/shippingApi.ts
import baseAxios from './baseAxios';
// types.ts
export interface ShippingMethod {
  id: number;
  name: string;
  fee: number;
  estimated_time: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const shippingApi = {
  async getMethods(provinceCode: string): Promise<ShippingMethod[]> {
    if (!provinceCode) return [];

    try {
      const res = await baseAxios.get<ApiResponse<ShippingMethod[]>>('/shipping-methods', {
        params: { province_code: provinceCode },
      });

      if (res.data.success && Array.isArray(res.data.data)) {
        return res.data.data;
      }
    } catch (err) {
      console.error('Lỗi khi gọi API shipping methods:', err);
    }

    return [];
  },
};
