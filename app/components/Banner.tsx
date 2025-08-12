'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from '../css/Banner.module.css';

const images = [
  '/images/banners/banner.png',
  '/images/banners/section_hot_banner.webp',
  '/images/banners/banner3.png',
]; // 📌 đặt file ảnh vào /public/banners/

export default function Banner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000); // ⏱️ Chuyển mỗi 4 giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.bg}>
    <div className={styles.slider}>
      <div
        className={styles.slideTrack}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <div className={styles.slide} key={i}>
            <Image src={src} alt={`banner-${i}`} fill priority />
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}
