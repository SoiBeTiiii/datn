import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Authentication = () => {
  const router = useRouter();

  useEffect(() => {
    // Lấy token và time_valid từ URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const timeValid = urlParams.get('time_valid');

    if (token) {
      // Lưu token vào localStorage
      localStorage.setItem('authToken', token);

      // Chuyển hướng người dùng về trang chính sau khi lưu token
      router.push('/');
    } else {
      alert('Không có token trong URL');
    }
  }, [router]);

  return (
    <div>
      <p>Đang xử lý đăng nhập...</p>
    </div>
  );
};

export default Authentication;
