// types/voucher.ts
export interface Voucher {
  id: number;
  code: string;
  description: string;
  discount_type: "percent" | "amount";
  discount_value: number;
  conditions: number;
  end_date: string;
  max_discount?: number;
}
