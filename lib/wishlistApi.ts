import baseAxios from './baseAxios';


export const getWishlists = async () => {
  try {
    const response = await baseAxios.get('/user/wishlists');
    return response.data; // Dữ liệu trả về từ API
  } catch (error) {
    console.error("Error fetching wishlists:", error);
    throw error; // Đẩy lỗi lên
  }
};
// Thêm sản phẩm vào wishlist
export const addToWishlist = async (product_slug: string) => {
  try {
    const response = await baseAxios.post('/user/wishlists', { product_slug });
    return response.data; // Dữ liệu trả về từ API
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error; // Đẩy lỗi lên
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (slug: string) => {
  try {
    const response = await baseAxios.delete(`/user/wishlists/${slug}`);
    return response.data; // Dữ liệu trả về từ API
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error; // Đẩy lỗi lên
  }
};
