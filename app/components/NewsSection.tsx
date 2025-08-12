"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../css/NewsSection.module.css';
import NewsCard from './NewsCard';
import BlogProps from '../interface/blog';
import fetchNewSection from '../../lib/newsectionApit';

export default function NewsSection() {
  const [news, setNews] = React.useState<BlogProps[]>([]);

  React.useEffect(() => {
    async function loadNews() {
      const data = await fetchNewSection();
      setNews(data);
    }
    loadNews();
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>TIN TỨC LÀM ĐẸP</h2>
      <div className={styles.Newgrid}>
        {news.map((n, i) => (
          <NewsCard
            key={i}
            image_url={n.image_url}
            published_at={n.published_at}
            title={n.title}
            excerpt={n.excerpt}
            slug={n.slug}
            id={n.id} content={n.content} category={n.category}          />
        ))}
      </div>
      <button className={styles.button}>Xem thêm tin tức khác →</button>
    </section>
  );
}






// import NewsCard from './NewsCard';
// import styles from '../css/NewsSection.module.css';

// const news = [
//   {
//     image: '/images/prop.webp',
//     day: '07',
//     month: 'THG 06',
//     title: 'Thuê Villa vũng tàu giá rẻ ở đâu ? -77-78',
//     description: 'Biển xanh, cát trắng, nắng vàng, một mùa hè sôi động nữa lại về và không có lý do gì chúng ta lại không lên kế hoạch du lịch Vũng Tàu ngay từ bây...',
//   },
//   // Lặp lại để có 3-4 tin
//   {
//     image: '/images/prop.webp',
//     day: '07',
//     month: 'THG 06',
//     title: 'Thuê Villa vũng tàu giá rẻ ở đâu ? -77-78',
//     description: 'Biển xanh, cát trắng, nắng vàng, một mùa hè sôi động nữa lại về và không có lý do gì chúng ta lại không lên kế hoạch du lịch Vũng Tàu ngay từ bây...',
//   },
//   {
//     image: '/images/prop.webp',
//     day: '07',
//     month: 'THG 06',
//     title: 'Thuê Villa vũng tàu giá rẻ ở đâu ? -77-78',
//     description: 'Biển xanh, cát trắng, nắng vàng, một mùa hè sôi động nữa lại về và không có lý do gì chúng ta lại không lên kế hoạch du lịch Vũng Tàu ngay từ bây...',
//   },
//   {
//     image: '/images/prop.webp',
//     day: '07',
//     month: 'THG 06',
//     title: 'Thuê Villa vũng tàu giá rẻ ở đâu ? -77-78',
//     description: 'Biển xanh, cát trắng, nắng vàng, một mùa hè sôi động nữa lại về và không có lý do gì chúng ta lại không lên kế hoạch du lịch Vũng Tàu ngay từ bây...',
//   }
// ];

// export default function NewsSection() {
//   return (
//     <section className={styles.section}>
//       <h2 className={styles.title}>TIN TỨC LÀM ĐẸP</h2>
//       <div className={styles.Newgrid}>
//         {news.map((n, i) => (
//           <NewsCard key={i} {...n} />
//         ))}
//       </div>
//       <button className={styles.button}>Xem thêm tin tức khác →</button>
//     </section>
//   );
// }
