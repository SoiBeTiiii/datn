"use client";
import React, { useEffect, useState } from "react";
import styles from "../css/BrandSlider.module.css";
import Image from "next/image";
import fetchBrands from "@/lib/brandApi";
import BrandProps from "../interface/brand";
import Link from "next/link";

const ITEMS_PER_SLIDE = 7;

export default function BrandSlider() {
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetchBrands()
      .then((result) => {
        console.log("✅ Fetched brands:", result);
        setBrands(result);
      })
      .catch((err) => {
        console.error("❌ Error fetching brands:", err);
      });
  }, []);

  const next = () => {
    setIndex((prev) =>
      prev + ITEMS_PER_SLIDE >= brands.length ? 0 : prev + ITEMS_PER_SLIDE
    );
  };

  const prev = () => {
    setIndex((prev) =>
      prev - ITEMS_PER_SLIDE < 0
        ? Math.max(0, brands.length - ITEMS_PER_SLIDE)
        : prev - ITEMS_PER_SLIDE
    );
  };

  const visibleBrands = brands.slice(index, index + ITEMS_PER_SLIDE);

  // Calculate the total number of slides based on the brands array
  const totalSlides = Math.ceil(brands.length / ITEMS_PER_SLIDE);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>THƯƠNG HIỆU NỔI BẬT</h2>
      <div className={styles.sliderWrapper}>
        <div className={styles.sliderContainer}>
          <div
            className={styles.slider}
            style={{
              transform: `translateX(-${index * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div className={styles.slide} key={slideIndex}>
                {brands
                  .slice(
                    slideIndex * ITEMS_PER_SLIDE,
                    slideIndex * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE
                  )
                  .map((brand, i) => (
                    <Link href={`/products?brand=${brand.slug}`} key={i}>
                      <div className={styles.brand}>
                        <Image
                          src={brand.logo || "/images/brands/default.png"}
                          alt={brand.name || `Brand ${i}`}
                          fill
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 'use client';
// import React, { useEffect, useRef, useState } from 'react';
// import styles from '../css/BrandSlider.module.css';
// import Image from 'next/image';

// const brands = [
//   '/images/brands/Beiflogo.webp',
//   '/images/brands/OHUIlogo.webp',
//   '/images/brands/Sumlogo.webp',
//   '/images/brands/Beiflogo.webp',
//   '/images/brands/Sulwhasoo.webp',
//   '/images/brands/PhysiogelLogo.webp',
//   '/images/brands/CNPlogo.webp',
//   '/images/brands/Beiflogo.webp',
// ];

// const ITEMS_PER_SLIDE = 5;
// const INTERVAL = 5000;

// export default function BrandSlider() {
//   const [index, setIndex] = useState(0);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);

//   const totalSlides = Math.ceil(brands.length / ITEMS_PER_SLIDE);

//   useEffect(() => {
//   intervalRef.current = setInterval(() => {
//     setIndex((prev) => {
//       const nextIndex = prev + 1;
//       return nextIndex >= totalSlides ? 0 : nextIndex;
//     });
//   }, INTERVAL);

//   return () => clearInterval(intervalRef.current!);
// }, [totalSlides]);

//   return (
//     <div className={styles.wrapper}>
//       <h2 className={styles.title}>THƯƠNG HIỆU NỔI BẬT</h2>
//       <div className={styles.sliderWrapper}>
//         <div className={styles.sliderContainer}>
//           <div
//             className={styles.slider}
//             style={{
//               transform: `translateX(-${index * 100}%)`,
//             }}
//           >
//             {Array.from({ length: totalSlides }).map((_, slideIndex) => (
//               <div className={styles.slide} key={slideIndex}>
//                 {brands
//                   .slice(
//                     slideIndex * ITEMS_PER_SLIDE,
//                     slideIndex * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE
//                   )
//                   .map((src, i) => (
//                     <div className={styles.brand} key={i}>
//                       <Image src={src} alt={`Brand ${i}`} fill objectFit="contain" />
//                     </div>
//                   ))}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
