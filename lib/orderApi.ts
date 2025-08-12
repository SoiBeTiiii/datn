import baseAxios from "./baseAxios";

export const checkoutOrder = async (data: any) => {
  const res = await baseAxios.post("checkout-orders", data);
  return res.data;
};
