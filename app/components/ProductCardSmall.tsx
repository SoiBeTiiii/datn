// components/ProductCardSmall.tsx
import styles from '../css/ProductCardSmall.module.css';

interface Product {
  id: number;
  image: string;
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
}

export default function ProductCardSmall({ product }: { product: Product }) {
  return (
    <div className={styles.card}>
      <img src={product.image} alt={product.name} className={styles.image} />
      <p className={styles.name}>{product.name}</p>
      <div className={styles.priceBox}>
        <span className={styles.price}>{product.price.toLocaleString()}₫</span>
        <s className={styles.original}>{product.originalPrice.toLocaleString()}₫</s>
      </div>
      <div className={styles.discount}>-{product.discountPercent}%</div>
    </div>
  );
}
