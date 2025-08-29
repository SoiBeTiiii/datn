'use client'
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { fetchBlogBySlug } from '@/lib/blogApi';
import styles from './BlogDetail.module.css';
import Category from '../../interface/Category';
import BlogDetailProps from '@/app/interface/blogDetail';
import BlogCard from '@/app/components/BlogCard';
import ProductCard from '@/app/components/ProductCard';
import BackToHomeButton from '@/app/components/BackToHomeButton';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [blog, setBlog] = useState<BlogDetailProps | null>(null);
  const [related, setRelated] = useState<BlogDetailProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {
      if (typeof slug !== 'string') {
        console.warn('❌ Slug không hợp lệ:', slug);
        return;
      }

      const data = await fetchBlogBySlug(slug);
      if (data?.blog) {
        setBlog(data.blog);
        setRelated(data.related_blogs || []);
      } else {
        console.warn('❌ Không có blog trong response');
      }

      setLoading(false);
    };

    loadBlog();
  }, [slug]);

  if (loading) return <p>Đang tải bài viết...</p>;
  if (!blog) return <p>Không tìm thấy bài viết hoặc đã bị xóa.</p>;

  return (
    <div className={styles.container}>
      {/* Tiêu đề */}
      <BackToHomeButton />
      <h1 className={styles.title}>{blog.title}</h1>

      {/* Thông tin meta */}
      <div className={styles.meta}>
        <span>📅 {blog.published_at}</span>
        {blog.created_by?.name && <span>👤 {blog.created_by?.name}</span>}
        {blog.views !== undefined && <span>👁️ {blog.views} lượt xem</span>}
      </div>

      {/* Mô tả ngắn nổi bật */}
      {blog.excerpt && <p className={styles.excerpt}><strong>{blog.excerpt}</strong></p>}

      {/* Nội dung HTML */}
      <div
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: blog.content || '' }}
      />

      {/* Sản phẩm liên quan */}
      {Array.isArray(blog.products) && blog.products.length > 0 && (
        <div className={styles.related}>
          <h2>Sản phẩm liên quan</h2>
          <div className={styles.relatedGrid}>
            {blog.products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                image={product.image}
                price={product.variants?.[0]?.sale_price ?? 0}
                originalPrice={product.variants?.[0]?.price ?? 0}
                discount={product.variants?.[0]?.sale_price
                  ? Math.round(
                    100 - (product.variants[0].sale_price * 100) / product.variants[0].price
                  )
                  : 0}
                sold={typeof product.sold === 'number' ? product.sold : 0}
                brand={typeof product.brand === 'string' ? product.brand : String(product.brand ?? 'No brand')} variants={[]} type={''} type_skin={''} is_featured={false}              />
            ))}
          </div>
        </div>
      )}

      {/* Bài viết liên quan */}
      {related.length > 0 && (
        <div className={styles.related}>
          <h2>Bài viết liên quan</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <BlogCard
                key={item.slug}
                slug={item.slug}
                title={item.title}
                image_url={item.image_url}
                excerpt={item.excerpt}
                category={item.category as Category} 
                id={0} 
                content={''}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
