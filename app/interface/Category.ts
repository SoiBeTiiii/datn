// export interface Category {
//   id: number;
//   name: string;
//   slug: string;
//   parent_id?: number;
//   description?: string;
//   thumbnail?: string;
//   is_active?: boolean;
//   is_featured?: boolean;
//   type?: string;
//   created_at?: string;  
//   updated_at?: string;
//   deleted_at?: string;
// }

export default interface Category {
  id: number;
  name: string;
  slug: string;
  thumbnail: string;
  is_active: boolean;
  is_featured: boolean;
  type?: string;
  description?: string;
  deleted_at?: string | null;
  children?: Category[];
  category_options?: any[]; 
}
