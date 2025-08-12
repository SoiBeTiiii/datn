import styles from '../css/Footer.module.css';
import Image from 'next/image';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        <div className={styles.column}>
          <h3>Về chúng tôi</h3>
          <strong>EGOMall</strong>
          <p>
            EGOMall - Cửa hàng chuyên phân phối các sản phẩm làm đẹp từ các thương hiệu hàng đầu. 
            Thuộc quyền sở hữu của Công ty TNHH EGOMALL. GPKD số: 12345678910 do Sở KHĐT TP.HCM cấp ngày 31/02/2025
          </p>
          <p>📍 Địa chỉ: 2133 Nguyễn Cảnh Tay, P. Nguyễn Cư Trinh, Q.1, TP.HCM</p>
          <p>📞 SĐT: 0090090999</p>
          <p>✉ Email: EGOMall.vn@gmail.com</p>
          <div className={styles.socials}>
            <FaFacebookF />
            <FaYoutube />
            <FaInstagram />
          </div>
        </div>

        <div className={styles.column}>
          <h4>Chính sách</h4>
          <ul>
            <li>Giới Thiệu</li>
            <li>Điều khoản dịch vụ</li>
            <li>Vận Chuyển & Giao Nhận</li>
            <li>Đổi Trả và Bảo Hành</li>
            <li>Phương Thức Thanh Toán</li>
            <li>Chính sách bảo mật</li>
            <li>Thông Tin Hàng Hoá</li>
            <li>Theo Dõi Đơn Hàng</li>
            <li>Liên hệ</li>
            <li>Tìm kiếm</li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Hỗ trợ khách hàng</h4>
          <ul>
            <li>Trang chủ</li>
            <li>Sản phẩm</li>
            <li>Blog</li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4>Đăng ký nhận tin</h4>
          <div className={styles.subscribe}>
            <input type="email" placeholder="Nhập địa chỉ email" />
            <button>Đăng ký</button>
          </div>
        
        
        </div>
      </div>
      <div className={styles.copyright}>
        © Bản quyền thuộc về EGOMall
      </div>
    </footer>
  );
}
