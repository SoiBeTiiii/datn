import baseAxios from "./baseAxios";
import BlogProps from "../app/interface/blog";
import BlogDetailProps, { Product } from "../app/interface/blogDetail";

export default async function fetchBlogs(category_id?: number | null): Promise<BlogProps[]> {
    const res = await baseAxios.get('/blogs', {params: category_id ? { category_id } : {}});
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
            category: {
                id: item.category.id,
                name: item.category.name,
                slug: item.category.slug,
                thumbnail: item.category.thumbnail || '',
                is_active: item.category.is_active || false,
                is_featured: item.category.is_featured || false,
                type: item.category.type || '',
                description: item.category.description || '',
                deleted_at: item.category.deleted_at || null,
                children: item.category.children || [],
                category_options: item.category.category_options || []
            },
            status: item.status || 'draft',
            views: item.views || 0,
            published_at: item.published_at || new Date().toISOString(),
            created_by: {
                name: item.created_by?.name || 'Unknown'
            },
            deleted_at: item.deleted_at || null
        } as BlogProps;
    }
    );
    return result;
}

type BlogBySlugResponse = {
  blog: BlogDetailProps;
  related_blogs: BlogDetailProps[];
  related_products?: Product[];
};

export async function fetchBlogBySlug(
  slug: string
): Promise<BlogBySlugResponse | null> {
  try {
    const res = await baseAxios.get<{ data: BlogBySlugResponse }>(`/blogs/${slug}`);
    const data = res.data?.data;
    return {
      blog: data.blog,
      related_blogs: data.related_blogs,
      related_products: data.related_products || [],
    };
  } catch (error) {
    console.error(`❌ Lỗi khi fetch blog:`, error);
    return null;
  }
}

export async function fetchLatestBlog(): Promise<BlogProps[]> {
    try {
        const res = await baseAxios.get(`/blogs/latest`);
        const data = res.data as { data: BlogProps[] };
        return data.data;
    } catch (error) {
        console.error(`Error fetching latest blogs:`, error);
        return [];
    }
}

// export async function fetchBlogById(id: number): Promise<BlogProps | null> {
//     try {
//         const res = await baseAxios.get(`/blogs/${id}`);
//         const data = res.data as BlogProps;
//         return data;
//     } catch (error) {
//         console.error(`Error fetching blog with id ${id}:`, error);
//         return null;
//     }
// }