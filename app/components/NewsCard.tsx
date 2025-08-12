import styles from '../css/NewsCard.module.css';
import React from 'react';
import BlogProps from '../interface/blog';
import Link from 'next/link';

export default function NewsCard({ image_url, title, excerpt, published_at, slug }: BlogProps & { published_at?: string }) {
  return (
    <Link href={`/blog/${slug}`}>
      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img src={image_url} alt={title} />
          <div className={styles.date}>
            <span>{new Date(published_at ?? '').getDay().toString()}</span><br />
            <span>---</span><br />
            <small>{new Date(published_at ?? '').getDate().toLocaleString()}</small>
          </div>
        </div>
        <div className={styles.content}>
          <h3>{title}</h3>
          <p>{excerpt}</p>
        </div>
      </div>
    </Link>
  );
}




// import styles from '../css/NewsCard.module.css';

// type Props = {
//   image: string;
//   day: string;
//   month: string;
//   title: string;
//   description: string;
// };

// export default function NewsCard({ image, day, month, title, description }: Props) {
//   return (
//     <div className={styles.card}>
//       <div className={styles.imageWrapper}>
//         <img src={image} alt={title} />
//         <div className={styles.date}>
//           <span>{day}</span>
//           <small>{month}</small>
//         </div>
//       </div>
//       <div className={styles.content}>
//         <h3>{title}</h3>
//         <p>{description}</p>
//       </div>
//     </div>
//   );
// }
