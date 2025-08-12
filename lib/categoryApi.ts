import baseAxios from "./baseAxios";

// import { Category } from "../app/interface/Category";

// export async function fetchCategories(): Promise<Category[]> {
//   const res = await baseAxios.get<{ data: Category[] }>("/categories");
//   return res.data.data; 
// }

import axios from 'axios';
import Category from '../app/interface/Category';

export async function fetchCategories(): Promise<Category[]> {
  const res = await baseAxios.get<{ data: Category[] }>('/categories', { params: { type: 'product' } });
  if (res.status === 200 && res.data && Array.isArray(res.data.data)) {
    return res.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      thumbnail: item.thumbnail,
      is_active: item.is_active,
      is_featured: item.is_featured,
      type: item.type,
      description: item.description,
      deleted_at: item.deleted_at,
      children: item.children || [],
      category_options: item.category_options || []
    } as Category));
  }
  return [];
}

export async function fetchBlogCategories(): Promise<Category[]> {
  const res = await baseAxios.get<{ data: Category[] }>('/categories', { params: { type: 'blog' } });

  if (res.status === 200 && res.data && Array.isArray(res.data.data)) {
    return res.data.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      thumbnail: item.thumbnail || '',
      is_active: item.is_active || false,
      is_featured: item.is_featured || false,
      type: item.type || '',
      description: item.description || '',
      deleted_at: item.deleted_at || null,
      children: item.children || [],
      category_options: item.category_options || []
    } as Category));
  }
  return [];
}
