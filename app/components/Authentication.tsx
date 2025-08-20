// app/components/Authentication.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Authentication = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null); // State để lưu trữ token

  // Effect này sẽ chạy khi component mount
  useEffect(() => {
    setIsMounted(true); // Đảm bảo chỉ chạy trên client
  }, []);

  // Lấy token từ localStorage ngay khi component mount
  useEffect(() => {
    if (isMounted) {
      // Kiểm tra token trong URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        // Lưu token vào localStorage và cập nhật state
        localStorage.setItem('authToken', tokenFromUrl);
        setToken(tokenFromUrl); // Cập nhật token state ngay lập tức
        router.push('/'); // Chuyển hướng về trang chủ
      } else {
        // Nếu không có token trong URL, lấy token từ localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken); // Cập nhật token từ localStorage
        } else {
          alert('Không có token trong URL và localStorage');
        }
      }
    }
  }, [isMounted, router]);

  // Hiển thị gì khi chưa mount
  if (!isMounted) return null; 

  return (
    <div>
      {token ? (
        <p>Đăng nhập thành công! Token: {token}</p>
      ) : (
        <p>Đang xử lý đăng nhập...</p>
      )}
    </div>
  );
};

export default Authentication;
