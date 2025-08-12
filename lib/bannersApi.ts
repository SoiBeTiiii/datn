import baseAxios from "./baseAxios";
import BannerProps from "../app/interface/banner";

export default async function fetchBanners(): Promise<BannerProps[]> {
  const res = await baseAxios.get('/banners');
  const data = res.data as {data: any[]};
  const raw = data.data;
  const result = raw.map((item) => {
    return {
      id: item.id,
      title: item.title || '',
      image_url: item.image_url || '',
      link_url: item.link_url || '',
      position: item.position || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      status: item.status || 0,
    } as BannerProps;
  });
  return result;
}