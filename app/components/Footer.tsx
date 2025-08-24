'use client';

import { useEffect, useState } from 'react';
import styles from '../css/Footer.module.css';
import { getPublicSettings, PublicSettings } from '../../lib/footerApi';

const Footer = () => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const data = await getPublicSettings();  // Gọi API lấy settings
      setSettings(data);
    };

    fetchSettings();  // Gọi hàm fetch settings khi component mount
  }, []);  // Chạy 1 lần khi component mount

  return (
    <footer className={styles.footer}>
      <div className={styles.contact}>
        <div className={styles.address}>
          {settings?.site_logo && (
            <img src={settings.site_logo} alt={settings.site_name} className={styles.logoImage} />
          )}
          <p>{settings?.site_address || 'Địa chỉ chưa có'}</p>
          <p>{settings?.hotline || 'Hotline đang cập nhật'}</p>
          <p>{settings?.contact_email || 'Email đang cập nhật'}</p>
        </div>

        <div className={styles.links}>
          <div className={styles.column}>
            <h4 className={styles.heading}>Help</h4>
            <ul className={styles.uli}>
              <li className={styles.li}>Search</li>
              <li className={styles.li}>Help</li>
              <li className={styles.li}>Information</li>
              <li className={styles.li}>Privacy Policy</li>
              <li className={styles.li}>Shipping Details</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>Support</h4>
            <ul className={styles.uli}>
              <li className={styles.li} >About us</li>
              <li className={styles.li} >Careers</li>
              <li className={styles.li} >Deliveries</li>
              <li className={styles.li} >Refund Requests</li>
              <li className={styles.li} >Contact us</li>
            </ul>
          </div>

          <div className={styles.column}>
            <h4 className={styles.heading}>Follow us</h4>
            <ul className={styles.uli}>
              {settings?.facebook_url && (
                <li className={styles.li}>
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">Facebook</a>
                </li>
              )}
              {settings?.youtube_url && (
                <li className={styles.li}>
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer">YouTube</a>
                </li>
              )}
              {settings?.tiktok_url && (
                <li className={styles.li}>
                  <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer">TikTok</a>
                </li>
              )}
              {settings?.instagram_url && (
                <li className={styles.li}>
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">Instagram</a>
                </li>
              )}
              {settings?.zalo_url && (
                <li className={styles.li}>
                  <a href={settings.zalo_url} target="_blank" rel="noopener noreferrer">Zalo</a>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>
          &copy; {new Date().getFullYear()} {settings?.site_name || 'EgoMall'}. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
