// app/ClientLayout.tsx
'use client';
import Header from "./components/HeaderSearch";
import { usePathname } from 'next/navigation';
import HeaderSearch from './components/HeaderSearch';
import Footer from './components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideLayout =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/verify-otp' ;

  return (
    <>
      {!hideLayout && <HeaderSearch />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
