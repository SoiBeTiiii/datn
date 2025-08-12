import baseAxios from "./baseAxios";
import BrandProps from "@/app/interface/brand";

export default async function fetchBrands(): Promise<BrandProps[]> {
  try {
    const res = await baseAxios.get<{ data: BrandProps[] }>("/brands"); // 👈 RẤT QUAN TRỌNG
    const brands = res.data.data;

    if (!Array.isArray(brands)) {
      console.error("❌ Không tìm thấy mảng thương hiệu:", res.data);
      return [];
    }

    return brands.map((item) => ({
      id: item.id || 0,
      name: item.name || "",
      slug: item.slug || "",
      logo: item.logo || "",
      description: item.description || "",
      is_active: item.is_active || 0,
      is_featured: item.is_featured || 0,
      created_at: item.created_at || "",
      updated_at: item.updated_at || "",
      delete_at: item.delete_at || "",
    }));
  } catch (err) {
    console.error("❌ Lỗi khi gọi API thương hiệu:", err);
    return [];
  }
}
