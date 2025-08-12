export default interface ProductCardProps {
  variants: never[];
  id: number;
  name: string;
  slug: string;
  image: string;
  brand: string ;
  price: number;
  originalPrice?: number | null;
  discount?: number;
  sold?: number;
  average_rating?: number;
    rating?: any;
      type: any;
  type_skin: any;

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
