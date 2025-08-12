'use client';

import { useEffect, useState } from 'react';
import styles from '../css/Popular.module.css';
import { fetchCategories } from '../../lib/categoryApi';
import Category from '../interface/Category';
import Link from 'next/link';

export default function PopularCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error("Lỗi khi fetch categories:", err));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>Danh mục sản phẩm</h2>
      </div>

      <div className={styles.list}>
        {categories.map((cat) => (
          <Link href={`/products?category=${cat.slug}`} key={cat.id}>
            <div className={styles.item}>
              <img src={cat.thumbnail} alt={cat.name} />
              <p>{cat.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
