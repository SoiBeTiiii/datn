// components/ServiceInfo.tsx
import styles from '../css/ServiceInfo.module.css';

const services = [
  {
    icon: '/images/icons/free-delivery_11153380.png',
    title: 'Giao hàng nhanh, miễn phí',
    description: 'Đơn hàng > 300 hoàn toàn miễn phí ship toàn quốc',
  },
  {
    icon: '/images/icons/parcel_2066599.png',
    title: 'Trả hàng & Bảo Hành',
    description: 'Không thích? Trả lại hoặc đổi hàng của bạn miễn phí trong vòng 30 ngày',
  },
  {
    icon: 'images/icons/voucher.png',
    title: 'Voucher & quà tặng tri ân',
    description: 'Luôn tặng kèm voucher & quà tặng cho khách hàng mới và khách hàng thân thiết',
  },
  {
    icon: 'images/icons/quality.png',
    title: 'Cam kết chính hãng',
    description: 'Shop cam kết sản phẩm chính hãng, nhập khẩu 100% từ hãng',
  },
];

export default function ServiceInfo() {
  return (
    <div className={styles.wrapper}>
      {services.map((service, idx) => (
        <div key={idx} className={styles.item}>
          <img src={service.icon} alt="" className={styles.icon} />
          <h4 className={styles.title}>{service.title}</h4>
          <p className={styles.desc}>{service.description}</p>
        </div>
      ))}
    </div>
  );
}
