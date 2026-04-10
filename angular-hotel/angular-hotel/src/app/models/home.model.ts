export interface TextImageSection {
  title: string;
  description: string;
  imageGradient: string;
  imageLink?: string;
}

export interface ImageGridItem {
  title: string;
  description: string;
  imageGradient: string;
  imageLink?: string;
}

export interface ImageGridSection {
  title: string;
  items: ImageGridItem[];
}

export interface HomePageData {
  intro: TextImageSection;
  islandInfo: TextImageSection;
  environment: ImageGridSection;
  rooms: TextImageSection;
  services: ImageGridSection;
  location: TextImageSection;
}
