import baseAxios from "./baseAxios";
import BlogProps from '../app/interface/blog';
export default async function fetchNewSection(): Promise<BlogProps[]> {
  const res = await baseAxios.get('/blogs/top-viewed');
  const data = res.data as { data: any[] };
  const raw = data.data;
  const result = raw.map((item) => {
    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      content: item.content,
      excerpt: item.excerpt,
      image_url: item.image_url,
      status: item.status,
      views: item.views,
      category_id: item.category_id,
      created_by: item.created_by,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted_at: item.deleted_at,
      category: item.category ?? null // Add category property, default to null if missing
    } as BlogProps;
  });
  return result;
}