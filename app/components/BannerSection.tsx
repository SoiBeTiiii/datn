"use client";
import { useEffect, useState } from "react";
import styles from "../css/BannerSection.module.css";
import Image from "next/image";
import fetchBanners from "../../lib/bannersApi";
import BannerProps from "../interface/banner";

export default function BannerSection() {
  const [banners, setBanners] = useState<BannerProps[]>([]);

  useEffect(() => {
    fetchBanners()
      .then((result) => {
        setBanners(result);
        console.log("Fetched banners:", result); // Kiểm tra dữ liệu ở đây
      })
      .catch((err) => {
        console.error("Error fetching banners: ", err);
      });
  }, []);

  return (
    <section className={styles.wrapper}>
      {banners.map((banner, index) => (
        <div className={styles.banner} key={index}>
          <Image
            className={styles.image}
            src={banner.image_url || ""}
            alt={`Banner ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ))}
    </section>
  );
}
