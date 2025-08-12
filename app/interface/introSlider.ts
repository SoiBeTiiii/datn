export interface SliderImage {
  id: number;
  slider_id: number;
  image_url: string;
  link_url: string;
  status: number;
}

export interface Slider {
  id: number;
  name: string;
  description: string;
  position: string;
  status: number;
  images: SliderImage[]; 
}

// export default interface IntroSliderProps {
//   id: number;
//   name: string;
//   slug: string;
//   image?: string;
//   description?: string;
//   is_active?: number;
//   created_at?: string;
//   updated_at?: string;
//   link?: string;
// }

