// app/components/Authentication.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Authentication = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null); // Dùng state để lưu token

  useEffect(() => {
    setIsMounted(true); // Đảm bảo chỉ chạy trên client
  }, []);

  useEffect(() => {
    if (isMounted) {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');

      if (tokenFromUrl) {
        // Lưu token vào localStorage
        localStorage.setItem('authToken', tokenFromUrl);
        setToken(tokenFromUrl); // Cập nhật state token ngay lập tức
        router.push('/'); // Chuyển hướng người dùng
      } else {
        // Nếu không có token trong URL, kiểm tra trong localStorage
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          setToken(storedToken); // Cập nhật lại token từ localStorage
        } else {
          alert('Không có token trong URL và localStorage');
        }
      }
    }
  }, [isMounted, router]);

  if (!isMounted) return null; // Không render gì nếu chưa mount

  return (
    <div>
      {token ? (
        <p>Đăng nhập thành công, Token: {token}</p>
      ) : (
        <p>Đang xử lý đăng nhập...</p>
      )}
    </div>
  );
};

export default Authentication;
