import baseAxios from "./baseAxios";
import Address from "../app/interface/address"
export const getAddresses = async (): Promise<Address[]> => {
  const res = await baseAxios.get("user/addresses");
  const data = res.data as { data: Address[] };
  return data.data || [];
};

export const deleteAddress = async (id: number): Promise<void> => {
  await baseAxios.delete(`/user/addresses/${id}`);
};

export const setDefaultAddress = async (id: number): Promise<void> => {
  await baseAxios.patch(`/user/addresses/${id}/default`);
};

export const updateAddress = async (id: number, data: any): Promise<void> => {
  await baseAxios.put(`/user/addresses/${id}`, data);
};

export const createAddress = async (data: any): Promise<void> => {
  await baseAxios.post("/user/addresses", data);
};

export const getProvinces = async (): Promise<{ code: string; name: string }[]> => {
  const res = await baseAxios.get("/location/provinces");
  return (res.data as { data: { code: string; name: string }[] }).data || [];
};

export const getDistricts = async (provinceCode: string): Promise<{ code: string; name: string }[]> => {
  const res = await baseAxios.get(`/location/provinces/${provinceCode}/districts`);
  return (res.data as { data: { code: string; name: string }[] }).data || [];
};

export const getWards = async (districtCode: string): Promise<{ code: string; name: string }[]> => {
  const res = await baseAxios.get(`/location/districts/${districtCode}/wards`);
  return (res.data as { data: { code: string; name: string }[] }).data || [];
};
