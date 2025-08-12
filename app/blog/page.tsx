'use client';

import React, { useEffect, useState } from 'react';
import styles from './Blog.module.css';
import BlogCard from '../components/BlogCard';
import fetchBlogs from '@/lib/blogApi';
import { fetchLatestBlog } from '@/lib/blogApi';
import { fetchBlogCategories } from '@/lib/categoryApi';
import Category from '@/app/interface/Category';
import BlogProps from '../interface/blog';
import Link from 'next/link';

export default function BlogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [blogs, setBlogs] = useState<BlogProps[]>([]);
  const [latestBlogs, setLatestBlogs] = useState<BlogProps[]>([]);

  // 🔹 Load danh mục bài viết (type = blog)
  useEffect(() => {
    async function loadCategories() {
      const data = await fetchBlogCategories();
      console.log('📂 Danh mục blog fetch được:', data);
      setCategories(data ?? []);
    }
    loadCategories();
  }, []);

  // 🔹 Load bài viết theo danh mục được chọn
  useEffect(() => {
    async function loadBlogs() {
      const data = await fetchBlogs(selectedCategory);
      setBlogs(data);
    }
    loadBlogs();
  }, [selectedCategory]);

  // 🔹 Load top bài viết mới nhất (hiển thị phần trên cùng)
  useEffect(() => {
    async function loadLatestBlogs() {
      const latest = await fetchLatestBlog();
      setLatestBlogs(latest);
    }
    loadLatestBlogs();
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>Trang chủ &gt; Chuyên mục làm đẹp</nav>
      <h1 className={styles.title}>Chuyên mục làm đẹp</h1>

      {/* 🔸 Phần featured blog ở đầu trang */}
      {latestBlogs.map((blog: BlogProps, index: number) => (
        <Link href={`/blog/${blog.slug}`} className={styles.featuredLink} key={index}>
          <section className={styles.featured}>
            <img src={blog.image_url} className={styles.featuredImg} alt="Blog chính" />
            <div className={styles.featuredContent}>
              <p className={styles.category}>{blog.category?.name ?? 'Tin tức mới nhất'}</p>
              <h2 className={styles.featuredTitle}>{blog.title}</h2>
              <p className={styles.excerpt}>{blog.excerpt}</p>
            </div>
          </section>
        </Link>
      ))}

      <h2 className={styles.subheading}>DANH MỤC BÀI VIẾT</h2>

      {/* ✅ Tabs cố định ban đầu bạn viết */}
      {/* <div className={styles.tabs}>
        <span className={styles.active}>Tất cả</span>
        <span>Tin tức</span>
        <span>Góc Review</span>
        <span>Cách Chăm Sóc Da</span>
        <span>Xu Hướng Trang Điểm</span>
      </div> */}

      {/* 🔹 Tabs động theo danh mục category (type = blog) */}
      <div className={styles.tabs}>
        <span
          className={selectedCategory === null ? styles.active : ''}
          onClick={() => setSelectedCategory(null)}
        >
          Tất cả
        </span>
        {categories.map((cate) => (
          <span
            key={cate.id}
            className={selectedCategory === cate.id ? styles.active : ''}
            onClick={() => setSelectedCategory(cate.id)}
          >
            {cate.name}
          </span>
        ))}
      </div>

      {/* 🔹 Danh sách bài viết tương ứng */}
      <div className={styles.grid}>
        {blogs.map((item, index) => (
          <BlogCard key={index} {...item} />
        ))}
      </div>

      {/* <div className={styles.more}>
        <button>XEM TẤT CẢ ➜</button>
      </div> */}
    </div>
  );
}


// import styles from './Blog.module.css';
// import BlogCard from '../components/BlogCard';

// const blogData = [
//   {
//     image: '/images/blogs/blog1.webp',
//     title: 'CÓ NÊN SỬ DỤNG MỸ PHẨM CẬN DATE VÀ GẦN HẾT HẠN SỬ DỤNG ???',
//     category: 'Tin tức',
//     excerpt: 'Sản phẩm cận date có nên dùng không? Cùng tìm hiểu ngay!',
//     slug: 'my-pham-can-date',
//   },
//   {
//     image: '/images/blogs/blog2.webp',
//     title: 'Top 5 kem dưỡng ẩm cho da mịn màng tốt nhất hiện nay',
//     category: 'Góc Review',
//     excerpt: 'Danh sách kem dưỡng bán chạy, hiệu quả vượt mong đợi...',
//     slug: 'my-pham-can-date2',
//   },
//   {
//     image: '/images/blogs/blog2.webp',
//     title: 'Top 5 kem dưỡng ẩm cho da mịn màng tốt nhất hiện nay',
//     category: 'Góc Review',
//     excerpt: 'Danh sách kem dưỡng bán chạy, hiệu quả vượt mong đợi...',
//     slug: 'my-pham-can-date',
//   },
//   {
//     image: '/images/blogs/blog1.webp',
//     title: 'Top sữa rửa mặt dịu nhẹ, không gây khô da cho mùa hè 2025',
//     category: 'Cách chăm sóc da',
//     excerpt: 'Giải pháp làm sạch sâu nhưng vẫn dịu nhẹ và an toàn...',
//     slug: 'my-pham-can-date',
//   },
//   // ... thêm bài khác nếu muốn
// ];

// export default function BlogPage() {
//   return (
//     <div className={styles.container}>
//       <nav className={styles.breadcrumb}>Trang chủ &gt; Chuyên mục làm đẹp</nav>
//       <h1 className={styles.title}>Chuyên mục làm đẹp</h1>

//       <section className={styles.featured}>
//         <img src="/images/blogs/blog1.webp" className={styles.featuredImg} alt="Blog chính" />
//         <div className={styles.featuredContent}>
//           <p className={styles.category}>Tin tức</p>
//           <h2 className={styles.featuredTitle}>
//             CÓ NÊN SỬ DỤNG MỸ PHẨM CẬN DATE VÀ GẦN HẾT HẠN SỬ DỤNG ???
//           </h2>
//           <p className={styles.excerpt}>
//             Sản phẩm đã sắp hết hạn thì mua làm gì? Thật ra vẫn dùng tốt và không ảnh hưởng nếu bạn biết cách chọn.
//           </p>
//         </div>
//       </section>

//       <h2 className={styles.subheading}>DANH MỤC BÀI VIẾT</h2>
//       <div className={styles.tabs}>
//         <span className={styles.active}>Tất cả</span>
//         <span>Tin tức</span>
//         <span>Góc Review</span>
//         <span>Cách Chăm Sóc Da</span>
//         <span>Xu Hướng Trang Điểm</span>
//       </div>

//       <div className={styles.grid}>
//         {blogData.map((item, index) => (
//           <BlogCard key={index} {...item} />
//         ))}
//       </div>

//       <div className={styles.more}>
//         <button>XEM TẤT CẢ ➜</button>
//       </div>
//     </div>
//   );
// }
