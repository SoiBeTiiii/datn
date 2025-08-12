import baseAxios from './baseAxios';
import { Slider } from '../app/interface/introSlider';

export default async function fetchSliders(): Promise<Slider[]> {
  try {
    const res = await baseAxios.get('/sliders');
    const rawData = res.data as { data: any[] };

    // 👉 Map về đúng interface
    const parsed = rawData.data.map((item: any, index: number) => ({
      id: index + 1, // giả định id
      name: item.name,
      description: item.description,
      position: item.position,
      status: item.status,
      images: item.image.map((img: any, imgIndex: number) => ({
        id: imgIndex + 1,
        slider_id: index + 1,
        image_url: img.url,
        link_url: img.link,
        status: 1,
      })),
    }));

    return parsed;
  } catch (error) {
    console.error("Lỗi fetch sliders:", error);
    return [];
  }
}


// export async function fetchIntroSilders(): Promise<IntroSliderProps[]> {
//   try {
//     const res = await baseAxios.get('/introsliders');
//     const introslider = res.data as { data: IntroSliderProps[] };
//     return introslider.data.map(introslider => ({
//       id: introslider.id,
//       name: introslider.name,
//       slug: introslider.slug, 
//       image: introslider.image,
//       description: introslider.description,
//       is_active: introslider.is_active,
//       created_at: introslider.created_at,
//       updated_at: introslider.updated_at,
//       link: introslider.link,
//     }));
//   } catch (err) {
//     console.error('Lỗi fetch intro sliders:', err);
//     return [];
//   }
// }
