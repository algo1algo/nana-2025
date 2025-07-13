export interface Wish {
  id: number;
  name: string;
  message: string;
  imageUrl?: string;
}

export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
}

export type GameId = 'starCatcher' | 'snake';

export interface Score {
  name: string;
  score: number;
}
