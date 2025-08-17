import { ReactNode, SetStateAction } from "react";

export interface GiftProduct {
  id: number;
  sku: string;
  price: number;
  sale_price: number;
  product_name: string | null;
  slug: string | null;
  image: string | null;
  options: {
    name: string;
    value: string;
  }[];
}

export interface Product {
  name: string;
  variant: string;
  quantity: number;
  price: number;
  sale_price: number;
  is_gift: boolean;
  is_gift_text: string | null;
  gift_product: GiftProduct | null;
}

export interface Order {
  payment_method: ReactNode;
  unique_id: string;
  // can_request_return: boolean;
  status: string; // e.g., 'ordered', 'delivered', etc.
  display_status: string; // e.g., 'Chờ xác nhận', 'Cần đánh giá'
  total_price: number;
  total_discount: string;
  delivered_at: string | null;
  can_cancel: boolean;
  can_review: boolean;
  can_request_return: boolean;
  return_status: string;
  return_reason: string;
  return_request_at:string;
  can_pay: boolean;
  products: Product[];
}

export interface OrderDetailResponse {
  data: SetStateAction<OrderDetailResponse | null>;
  unique_id: string;
  status: string;
  total_price: number;
  total_discount: string;
  delivered_at: string | null;
  can_pay: boolean;
  can_cancel: boolean;
  can_review: boolean;
  can_request_return: boolean;
  note: string;
  shipping_name: string;
  shipping_phone: string;
  payment_method: string;
  payment_date: string | null;
  payment_status: string;
  return_status: string;
  return_reason: string;
  return_request_at:string;
  address: string;
  shipping_method_snapshot: string;
  shipping_fee: string;
  coupon: string | null;
  products: OrderProduct[];
}

export interface OrderProduct {
  order_detail_id: number;
  name: string;
  image: string;
  variant: string;
  quantity: number;
  price: number;
  sale_price: number;
  is_gift: boolean;
  is_gift_text: string | null;
  gift_product: any | null;
  review: ProductReview | null;
}

export interface ProductReview {
  id: number;
  rating: number;
  comment: string;
  is_anonymous: number;
  images: string[];
  created_at: string;
  updated_at: string;
  can_update: boolean;
}

