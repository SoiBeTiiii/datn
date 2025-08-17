// app/not-found.tsx
import styles from './css/NotFound.module.css';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 - Không tìm thấy trang</h1>
      <p className={styles.description}>
        Trang bạn tìm không tồn tại. Quay về <Link href="/">trang chủ</Link>.
      </p>
    </div>
  );
}
