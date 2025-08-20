import baseAxios from './baseAxios';

// Định nghĩa kiểu dữ liệu cho thông tin settings
export interface PublicSettings {
  site_name: string;
  site_logo: string;
  site_address: string;
  hotline: string;
  contact_email: string;
  tiktok_url: string;
  instagram_url: string;
  youtube_url: string;
  facebook_url: string;
  zalo_url: string;
}

// Hàm lấy dữ liệu settings từ API
export const getPublicSettings = async (): Promise<PublicSettings | null> => {
  try {
    const response = await baseAxios.get('/public-settings');
    const data = response.data as { success: boolean; data: PublicSettings; message?: string };
    if (data.success) {
      return data.data;  // Trả về dữ liệu nếu thành công
    } else {
      console.error('Lỗi khi lấy settings:', data.message);
      return null;  // Trả về null nếu không thành công
    }
  } catch (error) {
    console.error('Lỗi khi gọi API settings:', error);
    return null;  // Trả về null nếu có lỗi trong quá trình gọi API
  }
};
