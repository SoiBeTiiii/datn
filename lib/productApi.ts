import baseAxios from './baseAxios';
import ProductCardProps from '../app/interface/ProductCardProps';
import {
  ProductDetail,
  ProductVariant,
  PromotionInfo,
  Review,
} from '../app/interface/ProductDetail';

type FilterParams = {
  search?: string;
  sort?: string;
  brand?: string[];
  types?: string[];
  type_skin?: string[];
  price_range?: string[];
  keyword?: string;
  category?: string;

};

/**
 * Lấy danh sách sản phẩm (hiển thị thông tin từ variant có giá thấp nhất)
 */
export const fetchProducts = async (
  filters: FilterParams = {}
): Promise<ProductCardProps[]> => {
  const searchParams = new URLSearchParams();

  if (filters.search) searchParams.append('search', filters.search);
  if (filters.sort) searchParams.append('sort', filters.sort);
  if (filters.brand?.length) searchParams.append('brand', filters.brand.join(','));
  if (filters.type_skin?.length) searchParams.append('type_skin', filters.type_skin.join(','));
  if (filters.price_range?.length) searchParams.append('price_range', filters.price_range.join(','));
    if (filters.category) searchParams.append('category', filters.category); // ✅ Thêm vào đây


  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await baseAxios.get(`${baseUrl}/products?${searchParams.toString()}`);
  const data = res.data as { data: any[] };
  // console.log(res);
  return data.data.map((item) => {
    const sortedVariants = (item.variants || []).sort((a: any, b: any) => {
      const priceA = a.final_price_discount ?? a.sale_price ?? a.price;
      const priceB = b.final_price_discount ?? b.sale_price ?? b.price;
      return priceA - priceB;
    });

    const variant = sortedVariants[0];
    const price = variant?.final_price_discount ?? variant?.sale_price ?? variant?.price ?? 0;
    const originalPrice = variant?.price ?? 0;
    const discount =
      originalPrice > 0 && price > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      brand: item.brand?.name, // có thể là object hoặc slug
      price,
      originalPrice,
      discount,
      type_skin:  item.type_skin,
      sold: item.sold_count,
      average_rating: item.average_rating ?? 0,
      variants: item.variants ?? [],
      is_featured: item.is_featured ?? false,
    } as ProductCardProps;
  });
};


export const fetchProductBySlug = async (
  slug: string
): Promise<ProductDetail | null> => {
  try {
    // Không cần nối baseURL thủ công nữa vì baseAxios đã cấu hình sẵn
    // 1. Lấy chi tiết sản phẩm
    const resProduct = await baseAxios.get(`/product/${slug}`);
    const productData = resProduct.data as { data: ProductDetail[] };
    const product = productData.data?.[0];

    if (!product) return null;

    // 2. Lấy mapping khuyến mãi đang áp dụng
    const resPromo = await baseAxios.get(`/promotions`);
    const promoRaw = resPromo.data as { data: Record<string, PromotionInfo> };
    const promoMap = promoRaw.data;

    // 3. Gán khuyến mãi theo sản phẩm
    const productPromoKey = `product_${product.id}`;
    if (promoMap[productPromoKey]) {
      product.promotion = promoMap[productPromoKey];
    }

    // 4. Gán khuyến mãi theo từng variant
    product.variants = product.variants.map((variant: ProductVariant) => {
      const variantPromoKey = `variant_${variant.id}`;
      if (promoMap[variantPromoKey]) {
        variant.promotion = promoMap[variantPromoKey];
      }
      return variant;
    });

    return product;
  } catch (error) {
    console.error('fetchProductBySlug error:', error);
    return null;
  }
};
export const fetchTypeSkinOnly = async (): Promise<string[]> => {
  try {
    const products: ProductCardProps[] = await fetchProducts({}); // gọi API không filter

    const uniqueTypeSkins = Array.from(
      new Set(products.map((p) => p.type_skin).filter(Boolean))
    );

    return uniqueTypeSkins;
  } catch (error) {
    console.error("Lỗi khi fetch loại da:", error);
    return [];
  }
};



export const fetchVariantById = async (variantId: number) => {
  try {
    const response = await baseAxios.get<{ data: any[] }>("/products");


    const products = response.data.data;

    for (const product of products) {
      const variant = product.variants.find((v: any) => v.id === variantId);

      if (variant) {
        const result = {
          variantId: variant.id,
          name: product.name,
          productId: product.id,
          image: variant.image || product.image,
          originalPrice: variant.price,
          salePrice: variant.sale_price,
          optionLabels: variant.option_labels,
        };


        return result;
      }
    }

    console.warn(`❌ [fetchVariantById] Không tìm thấy variant ID ${variantId}`);
    throw new Error(`Không tìm thấy variant có ID ${variantId}`);
  } catch (error) {
    console.error("🔥 Lỗi khi fetch variant:", error);
    throw error;
  }
};

export const fetchReviewsByProductSlug = async (slug: string): Promise<Review[]> => {
  try {
    const response = await baseAxios.get<{ data: Review[] }>(`/products/${slug}/reviews`);
    console.log('fetchReviewsByProductSlug response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá sản phẩm:', error);
    return [];
  }
};

export const fetchProductsByFilterKey = async (
  filterType: "brand" | "category",
  filterSlug: string,
  sort?: string
): Promise<ProductCardProps[]> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const url = `${baseUrl}/products?${filterType}=${filterSlug}${sort ? `&sort=${sort}` : ""}`;

  const res = await baseAxios.get(url);
  const data = res.data as { data: any[] };

  return data.data.map((item) => {
    const sortedVariants = (item.variants || []).sort((a: ProductVariant, b: ProductVariant) => {
      const priceA = a.final_price_discount ?? a.sale_price ?? a.price;
      const priceB = b.final_price_discount ?? b.sale_price ?? b.price;
      return priceA - priceB;
    });

    const variant = sortedVariants[0];
    const price = variant?.final_price_discount ?? variant?.sale_price ?? variant?.price ?? 0;
    const originalPrice = variant?.price ?? 0;
    const discount =
      originalPrice > 0 && price > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      brand: item.brand?.name,
      price,
      originalPrice,
      discount,
      sold: item.sold_count,
      average_rating: item.average_rating ?? 0,
      variants: item.variants ?? [],
      type: item.type ?? '', // Add type property
      type_skin: item.type_skin ?? '', // Add type_skin property
      is_featured: item.is_featured ?? false,
    };
  });
};


export const fetchPromotedProducts = async (): Promise<ProductCardProps[]> => {
  const res = await baseAxios.get("/products?has_promotion=1");
  const data = res.data as { data: any[] };

  return (data.data || []).map((item) => {
    const sortedVariants = (item.variants || []).sort((a: ProductVariant, b: ProductVariant) => {
      const priceA = (a as any).final_price_discount ?? a.sale_price ?? a.price;
      const priceB = (b as any).final_price_discount ?? b.sale_price ?? b.price;
      return (priceA ?? Infinity) - (priceB ?? Infinity);
    });

    const variant = sortedVariants[0];
    const price = (variant as any)?.final_price_discount ?? variant?.sale_price ?? variant?.price ?? 0;
    const originalPrice = variant?.price ?? 0;
    const discount =
      originalPrice > 0 && price > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      brand: item.brand?.name,
      price,
      originalPrice,
      discount,
      sold: item.sold_count ?? 0,
      average_rating: item.average_rating ?? 0,
      variants: item.variants ?? [],
      type_skin: item.type_skin ?? "",
      is_featured: item.is_featured ?? false,
    } as ProductCardProps;
  });
};

export const fetchFeaturedProducts = async (): Promise<ProductCardProps[]> => {
  const res = await baseAxios.get("/products?is_featured=1");
  const data = res.data as { data: any[] };

  return (data.data || []).map((item) => {
    const sortedVariants = (item.variants || []).sort((a: ProductVariant, b: ProductVariant) => {
      const priceA = (a as any).final_price_discount ?? a.sale_price ?? a.price;
      const priceB = (b as any).final_price_discount ?? b.sale_price ?? b.price;
      return (priceA ?? Infinity) - (priceB ?? Infinity);
    });

    const variant = sortedVariants[0];
    const price = (variant as any)?.final_price_discount ?? variant?.sale_price ?? variant?.price ?? 0;
    const originalPrice = variant?.price ?? 0;
    const discount =
      originalPrice > 0 && price > 0
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      image: item.image,
      brand: item.brand?.name,
      price,
      originalPrice,
      discount,
      sold: item.sold_count ?? 0,
      average_rating: item.average_rating ?? 0,
      variants: item.variants ?? [],
      type_skin: item.type_skin ?? "",
      is_featured: item.is_featured ?? false,
    } as ProductCardProps;
  });
};