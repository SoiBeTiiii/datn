"use client";

import { useState, useEffect } from "react";
import { getSliderData } from "@/lib/sliderApi"; // Import hàm từ sliderApi.js
import styles from "../css/IntroSlider.module.css";
import Image from "next/image";

export default function VillaSlider() {
  const [sliderData, setSliderData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Lấy dữ liệu slider từ backend thông qua sliderApi
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getSliderData(); // Gọi hàm lấy dữ liệu từ sliderApi
        if (typeof data === "object" && data !== null && "data" in data) {
          setSliderData((data as { data: any[] }).data); // Lưu dữ liệu slider vào state
        } else {
          setSliderData([]); // fallback nếu không đúng định dạng
        }
      } catch (error) { 
        console.error("Lỗi khi lấy dữ liệu slider:", error);
      }
    };

    getData();
  }, []); // Chạy khi component mount

  // Sắp xếp ảnh theo display_order
  const sortedImages = sliderData[0]?.image?.sort(
    (a: { display_order: number; url: string }, b: { display_order: number; url: string }) =>
      a.display_order - b.display_order
  );

  const handleSelect = (index: number) => {
    setCurrentIndex(index);
  };

  if (sliderData.length === 0) {
    return <div>Loading...</div>; // Hiển thị khi chưa có dữ liệu
  }

  const description = sliderData[0]?.description;

  return (
    <div className={styles.wrapper}>
      <div className={styles.left}>
        <h2>WELCOME TO</h2>
        <h1>EGOMALL</h1>
        <p>{description}</p> {/* Hiển thị mô tả từ dữ liệu backend */}
        <button className={styles.button}>Xem chi tiết →</button>
      </div>

      <div className={styles.right}>
        <div className={styles.imageWrapper}>
          <Image
            key={currentIndex}
            src={sortedImages[currentIndex]?.url} // Hiển thị ảnh chính theo display_order
            alt="Villa"
            width={700}
            height={500}
            className={styles.mainImage}
          />
        </div>

        <div className={styles.thumbnailRow}>
          {sortedImages.map((img: { display_order: number; url: string }, index: number) => (
            <button
              key={index}
              className={`${styles.thumb} ${currentIndex === index ? styles.active : ''}`}
              onClick={() => handleSelect(index)}
            >
              <Image src={img.url} alt={`thumb-${index}`} width={100} height={70} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
