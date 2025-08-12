import styles from '../css/SuggestProduct.module.css';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  oldPrice: string;
  sold: number;
  discount: string;
  rating: number;
}

export default function ProductCard({
  image,
  name,
  price,
  oldPrice,
  sold,
  discount,
  rating,
}: ProductCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.discountBadge}>{discount}</span>
      <img src={image} alt={name} className={styles.image} />
      <p className={styles.brand}>WHOO</p>
      <h3 className={styles.name}>{name}</h3>
      <div className={styles.priceWrap}>
        <span className={styles.price}>{price}</span>
        <span className={styles.oldPrice}>{oldPrice}</span>
      </div>
      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            color={i < rating ? '#fbbf24' : '#e5e7eb'}
            size={12}
          />
        ))}
        <span className={styles.reviewCount}>(0 đánh giá)</span>
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progress}>
          <div
            className={styles.bar}
            style={{ width: `${Math.min(sold, 100)}%` }}
          ></div>
        </div>
        <span className={styles.sold}>{sold} sản phẩm đã bán</span>
      </div>
      <button className={styles.buyNow}>
        MUA NGAY <FaShoppingCart size={14} />
      </button>
    </div>
  );
}
