export default interface ProductCardProps {
  is_featured: boolean;
  // parentProductId: any;
  // promotion: any;
  variants: never[];
  id: number;
  name: string;
  slug: string;
  image: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  sold_count?: number;
  average_rating?: number;
  type: any;
  type_skin: string;

}



// export default interface ProductCardProps {
//   id: number;
//   slug: string;
//   name?: string;
//   image?: string;
//   price?: number;
//   originalPrice?: number;
//   sold?: number;
//   discount?: number;
//   rating?: number;
//   final_price_discount?: number;
// }
