import Image from "next/image";
import styles from "./page.module.css";
import PopularCategories from "./components/PopularCategory";
import ProductListSlider from "./components/ProductListSlider";
import ServiceInfo from "./components/ServiceInfo";
import SuggestList from "./components/SuggestList";
import BrandSlider from "./components/BrandSlider";
import NewsSection from "./components/NewsSection";
import IntroSlider from "./components/IntroSlider";
import PromotionList from "./components/PromotionList";
import BannerSection from "./components/BannerSection"
import Banner from "./components/Banner";
export default function Home() {
  return (
    <div className={styles.container}>
      <IntroSlider />
      <PopularCategories /> 
      <PromotionList />
      <BannerSection />
      <ProductListSlider />
      <ServiceInfo />
      <SuggestList />
      <BrandSlider />
      <NewsSection />
    </div>
  );
}
