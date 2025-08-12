export default interface ProductCardProps {
  endDate: any;
  id: number;
  name: string;
  slug?: string;
  price: number;
  originalPrice: number;
  image: string;
  sold?: number;
  discount?: number;
  rating?: number;
  final_price_discount?: number;
  promotionName?: string; 
  conditions?: any;
   promotionLabel?: string;
}
