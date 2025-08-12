import baseAxios from "./baseAxios";

interface ProductSearchResult {
  id: number;
  name: string;
  slug: string;
  image: string;
}

export default async function searchProducts(keyword: string): Promise<ProductSearchResult[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${baseUrl.replace(/\/$/, "")}/search?search=${encodeURIComponent(keyword)}`;
  console.log("🔍 Search URL:", url);

  try {
    const res = await baseAxios.get<{ data: any[] }>(url);
    const data = res.data?.data || [];

    return data.map((item: any, index: number) => ({
      id: item.id ?? index,
      name: item.name,
      slug: item.slug,
      image: item.image || "/images/default-product.png",
    }));
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    return [];
  }
}
