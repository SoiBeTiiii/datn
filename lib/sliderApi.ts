import baseAxios from './baseAxios';

// Hàm để lấy dữ liệu slider từ API
export const getSliderData = async () => {
  try {
    const response = await baseAxios.get('/sliders'); // Gọi API để lấy slider data
    return response.data; // Trả về dữ liệu từ backend
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu slider:", error);
    throw error; // Đẩy lỗi lên để xử lý bên ngoài
  }
};
