// lib/apis/voucherApi.ts
import { Voucher } from "@/app/interface/voucher";
import baseAxios from "./baseAxios";

export async function getVouchers(): Promise<Voucher[]> {
  const res = await baseAxios.get("/vouchers");
  const data = res.data as { data: Voucher[] };
  return data.data; // trả về mảng voucher
};
