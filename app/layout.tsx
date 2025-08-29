import "./globals.css";
import BannerSlider from "./components/BannerSection";
import HeaderSearch from "./components/HeaderSearch";
import IntroSlider from "./components/IntroSlider";
import Footer from "./components/Footer";
import ClientLayout from "./ClientLayout"; // thêm file này
import { CartProvider } from "./context/CartConText";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/Chatbot"; // thêm chatbot nếu cần
export const metadata = {
  title: "Egomall",
  description: "I have followed setup instructions carefully",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body>z
        <AuthProvider>
          <CartProvider>
            <Chatbot />
            <ClientLayout>{children}</ClientLayout>
            <ToastContainer position="top-right" autoClose={3000} />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
