// app/components/Authentication.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const Authentication = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true); // Đảm bảo chỉ chạy trên client
  }, []);

  useEffect(() => {
    if (isMounted) {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (token) {
        // Lưu token vào localStorage
        localStorage.setItem('authToken', token);
        
        // Chuyển hướng người dùng về trang chính sau khi lưu token
        router.push('/');
      } else {
        alert('Không có token trong URL');
      }
    }
  }, [isMounted, router]);

  if (!isMounted) return null; // Không render gì nếu chưa mount

  return (
    <div>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default Authentication;
