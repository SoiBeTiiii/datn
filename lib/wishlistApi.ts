import baseAxios from './baseAxios';

export interface WishlistItem {
  slug: string;
  name: string;
  image: string;
  variants: {
    price: number;
    sale_price?: number;
  }[];
}

export async function getWishlists(): Promise<{ data: WishlistItem[] }> {
  try {
    const res = await baseAxios.get<{ data: WishlistItem[] }>("/user/wishlists");
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      // Nếu chưa đăng nhập hoặc token hết hạn, trả về mảng rỗng thay vì ném lỗi
      return { data: [] }; // Hoặc có thể hiển thị thông báo khác tùy theo yêu cầu
    }
    throw error; // Ném lỗi khác nếu không phải 401
  }
}

// Thêm sản phẩm vào wishlist
export const addToWishlist = async (product_slug: string) => {
  try {
    const response = await baseAxios.post("/user/wishlists", { product_slug });
    return response.data;
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    throw error; // ✅ ném lỗi để nơi gọi xử lý bằng catch
  }
};




// Xóa sản phẩm khỏi wishlist

export const removeFromWishlist = async (slug: string) => {
  try {
    const response = await baseAxios.delete(`/user/wishlists/${slug}`);
    return response.data;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw error;
  }
};

