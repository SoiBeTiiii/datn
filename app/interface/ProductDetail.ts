export interface ProductOption {
  id: number;
  name: string;
  value_ids: (string | number)[];
  value_labels: string[];
}

export interface ProductVariant {
  id: number;
  sku: string;
  price: number;
  sale_price: number;
  final_price_discount?: number | null;
  quantity: number;
  is_active: boolean;
  option_value_ids: (string | number)[];
  option_labels: string;
  image?: string;
  promotion?: {
    endDate: string;
  };
  options?: {
    name: string;
    value: string;
  }[]; 
}

export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  brand: string;
  image: string;
  status: string;
  description: string;
  average_rating: number;
  review_count: number;
  options: ProductOption[];
  variants: ProductVariant[];
  promotion?: {
    endDate: string;
  };
  reviews?: any[];
  related: {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price: number;
    final_price_discount: number | null;
    brand: string;
    image: string;
    average_rating: number;
    review_count: number;
  }[];
}

// // Thông tin khuyến mãi áp dụng cho variant hoặc product
export interface PromotionCondition {
  type: "buy_get" | string; // mở rộng khi cần
  buyQuantity: number;
  getQuantity: number;
  giftType: "variant" | "product";
  giftProductVariantId: number;
  parentProductId: number;
}

// // Khuyến mãi áp dụng cho product hoặc variant
export interface PromotionInfo {
  type: "product" | "variant";
  promotionId: number;
  promotionName: string;
  endDate: string;
  conditions: PromotionCondition;
  soldQuantity: number;
}

export interface Review {
  id: number;
  user: {
    id: number;
    name: string;
    image: string | null;
  };
  rating: number;
  comment: string;
  is_anonymous: number;
  images: string[];
  status: string;
  reply?: {
    id: number;
    user: {
      id: number;
      name: string;
      role: string;
    };
    reply: string;
    date: string;
  };
  created_at: string;
  updated_at: string;
}

// // Khuyến mãi cơ bản (nếu gắn trực tiếp vào variant như cũ)
// export interface VariantPromotion {
//   id: number;
//   name: string;
//   discount_type: "percent" | "amount";
//   discount_value: number;
//   start_date: string;
//   end_date: string;
//   status: number;
// }

// // Biến thể của sản phẩm
// export interface ProductVariant {
//   id: number;
//   sku: string;
//   price: number;
//   sale_price: number;
//   final_price_discount: number | null;
//   image: string;
//   quantity: number;

//   // ✅ Nếu backend trả promotion gắn trực tiếp vào variant (theo mapping từ /promotions/active-map)
//   promotion?: PromotionInfo;

//   options: {
//     name: string;
//     value: string;
//   }[];
// }

// // Đánh giá sản phẩm
// export interface ProductReview {
//   name: string;
//   image: string | null;
//   rating: number;
//   comment: string;
//   date: string;
// }

// // Sản phẩm liên quan
// export interface RelatedProduct {
//   id: number;
//   name: string;
//   slug: string;
//   price: number;
//   sale_price: number;
//   final_price_discount: number | null;
//   brand: string;
//   image: string;
//   average_rating: number;
//   review_count: number;
// }

// // Chi tiết sản phẩm chính
// export interface ProductDetail {
//   id: number;
//   name: string;
//   slug: string;
//   brand: string;
//   image: string;
//   status: string;
//   description: string;
//   average_rating: number;
//   review_count: number;
//   reviews: ProductReview[];
//   variants: ProductVariant[];
//   related: RelatedProduct[];
//   promotion?: PromotionInfo; // ✅ thêm dòng này
// }





// export interface ProductVariant {
//   id: number;
//   sku: string;
//   price: number;
//   sale_price: number;
//   image: string;
//   quantity: number;
//   options: {
//     name: string;
//     value: string;
//   }[];
// }

// export interface ProductReview {
//   name: string;
//   image: string | null;
//   rating: number;
//   comment: string;
//   date: string;
// }

// export interface RelatedProduct {
//   id: number;
//   name: string;
//   slug: string;
//   price: number;
//   sale_price: number;
//   brand: string;
//   image: string;
//   average_rating: number;
//   review_count: number;
// }

// export interface ProductDetail {
//   description: string;
//   id: number;
//   name: string;
//   slug: string;
//   brand: string;
//   image: string;
//   status: string;
//   average_rating: number;
//   review_count: number;
//   reviews: ProductReview[];
//   variants: ProductVariant[];
//   related: RelatedProduct[];
// }
