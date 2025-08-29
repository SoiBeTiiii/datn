// interface/User.ts
export interface User {
  name: string;
}

// interface/Category.ts
import Category  from './Category';

// interface/Product.ts
export interface Product {
  sold_count: number;
  id: number;
  name: string;
  slug: string;
  category: number;
  brand: string;
  type_skin: string | null;
  description: string;
  image: string;
  average_rating: number;
  review_count: number;
  variants: {
    id: number;
    sku: string;
    price: number;
    sale_price: number | null;
    options: {
      name: string;
      value: string;
    }[];
  }[];
}

// interface/BlogSummary.ts
export interface BlogSummary {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  status: string;
  views: number;
  published_at: string;
}

export default interface BlogDetailProps {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  status: string;
  views: number;
  published_at: string;
  category: Category;
  created_by: User;
  products?: Product[];

  // Optional if your API might not include these
  related_blogs?: BlogSummary[];
}
