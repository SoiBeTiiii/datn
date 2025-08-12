import  Category  from './Category';

export default interface BlogProps {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image_url: string;
  category: Category;
  status?: string;
  views?: number;
  published_at?: string;
  created_by?: {
    name: string;
  };
  deleted_at?: string | null;
}
