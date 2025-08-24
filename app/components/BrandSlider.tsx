"use client";
import React, { useEffect, useState, useRef } from "react";
import styles from "../css/BrandSlider.module.css";
import Image from "next/image";
import fetchBrands from "@/lib/brandApi";
import BrandProps from "../interface/brand";
import Link from "next/link";

const ITEMS_PER_SLIDE = 6;
const AUTO_PLAY_DELAY = 3000; // 3s

export default function BrandSlider() {
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchBrands()
      .then((result) => setBrands(result))
      .catch((err) => console.error("Error fetching brands:", err));
  }, []);

  const totalSlides = Math.ceil(brands.length / ITEMS_PER_SLIDE);

  const nextSlide = () => {
    setSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setSlideIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Auto play
  useEffect(() => {
    if (brands.length === 0) return;
    autoSlideRef.current = setInterval(nextSlide, AUTO_PLAY_DELAY);
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [brands]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>THƯƠNG HIỆU NỔI BẬT</h2>
      <div className={styles.sliderWrapper}>
        <button className={styles.prevBtn} onClick={prevSlide}>
          ◀
        </button>
        <div className={styles.sliderContainer}>
          <div
            className={styles.slider}
            style={{
              transform: `translateX(-${slideIndex * 100}%)`,
              transition: 'transform 0.6s ease-in-out',
            }}
          >
            {Array.from({ length: totalSlides }).map((_, i) => (
              <div className={styles.slide} key={i}>
                {brands
                  .slice(i * ITEMS_PER_SLIDE, i * ITEMS_PER_SLIDE + ITEMS_PER_SLIDE)
                  .map((brand, idx) => (
                    <Link href={`/products?brand=${brand.slug}`} key={idx}>
                      <div className={styles.brand}>
                        <Image
                          className={styles.brandImage}
                          src={brand.logo || "/images/brands/default.png"}
                          alt={brand.name || `Brand ${idx}`}
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
        <button className={styles.nextBtn} onClick={nextSlide}>
          ▶
        </button>
      </div>
    </div>
  );
}
