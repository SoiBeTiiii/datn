// types/voucher.ts
export interface Voucher {
  is_voucher_valiable: boolean;
  id: number;
  code: string;
  description: string;
  discount_type: "percent" | "amount";
  discount_value: number;
  conditions: number;
  end_date: string;
  max_discount?: number;
}
