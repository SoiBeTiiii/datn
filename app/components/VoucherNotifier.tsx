"use client";

import React, { useState, useEffect } from "react";
import styles from "../css/VoucerNotifer.module.css";
import { MdLocalOffer, MdClose, MdContentCopy } from "react-icons/md";
import baseAxios from '../../lib/baseAxios'; 
interface Voucher {
  id:number;
   code: string;
  description: string;
  discount_type: string;
  discount_value: number;
  conditions: number;
  end_date: string;
  max_discount: number;
}

export default function VoucherNotifier() {
  const [open, setOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [vouchers, setVouchers] = useState<Voucher[]>([]);

useEffect(()=> {
  const fetchPromotions = async () => {
    try {
      const res = await baseAxios.get('vouchers');
      const data = res.data as { data: any };
      const values = Object.values(data.data) as Voucher[];
      setVouchers(values);
    }
    catch (error){
      console.error("Lỗi khi lấy dữ liệu khuyến mãi:", error);
    }
  };
  fetchPromotions();
}, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Đã sao chép mã: ${code}`);
  };

  return (
    <>
      <div className={styles.floatingBtn} onClick={() => setOpen(true)}>
        <MdLocalOffer size={20} />
        {/* <span>Danh sách mã Coupon</span> */}
      </div>

      {open && (
        <div className={styles.overlay}>
          <div className={styles.popup}>
            <div className={styles.popupHeader}>
              <h3>Danh sách mã khuyến mãi:</h3>
              <MdClose className={styles.closeIcon} onClick={() => setOpen(false)} />
            </div>
            <div className={styles.voucherList}>
              {vouchers.map((p) => (
                <div key={p.id} className={styles.voucherItem}>
                  <div className={styles.voucherInfo}>
                    <strong>{p.description}</strong>
                    <p>HSD: đến hết {p.end_date}</p>
                    <p>
                      Mã:{' '}
                      <span className={styles.voucherCode}>
                        {p.code}
                      </span>
                    </p>
                  </div>
                  <button className={styles.copyBtn} onClick={() => handleCopy(p.code)}>
                    <MdContentCopy /> Sao chép
                  </button>
                </div>
              ))}

              <p className={styles.note}>
                * Mã khuyến mãi chỉ áp dụng cho website chính hãng. <br />
                <b>Vui lòng kiểm tra điều kiện áp dụng trong chi tiết sản phẩm.</b>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
