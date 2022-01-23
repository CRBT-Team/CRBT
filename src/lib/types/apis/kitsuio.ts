export interface Anime {
  data: Datum[];
  meta: AnimeMeta;
  links: AnimeLinks;
}

export interface Datum {
  id: string;
  type: string;
  links: DatumLinks;
  attributes: Attributes;
  relationships: { [key: string]: Relationship };
}

export interface Attributes {
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  synopsis: string;
  description: string;
  coverImageTopOffset: number;
  titles: Titles;
  canonicalTitle: string;
  abbreviatedTitles: string[];
  averageRating: null | string;
  ratingFrequencies: { [key: string]: string };
  userCount: number;
  favoritesCount: number;
  startDate: Date | null;
  endDate: Date | null;
  nextRelease: null;
  popularityRank: number;
  ratingRank: number | null;
  ageRating: string;
  ageRatingGuide: string;
  subtype: string;
  status: string;
  tba: null | string;
  posterImage: PosterImage;
  coverImage: CoverImage | null;
  episodeCount: number | null;
  episodeLength: number | null;
  totalLength: number | null;
  youtubeVideoId: null | string;
  showType: string;
  nsfw: boolean;
}

export interface CoverImage {
  tiny: string;
  large: string;
  small: string;
  original: string;
  meta: CoverImageMeta;
}

export interface CoverImageMeta {
  dimensions: PurpleDimensions;
}

export interface PurpleDimensions {
  tiny: Large;
  large: Large;
  small: Large;
}

export interface Large {
  width: number | null;
  height: number | null;
}

export interface PosterImage {
  tiny: string;
  large: string;
  small: string;
  medium: string;
  original: string;
  meta: PosterImageMeta;
}

export interface PosterImageMeta {
  dimensions: FluffyDimensions;
}

export interface FluffyDimensions {
  tiny: Large;
  large: Large;
  small: Large;
  medium: Large;
}

export interface Titles {
  en?: string;
  en_jp: string;
  en_us?: string;
  ja_jp: string;
}

export interface DatumLinks {
  self: string;
}

export interface Relationship {
  links: RelationshipLinks;
}

export interface RelationshipLinks {
  self: string;
  related: string;
}

export interface AnimeLinks {
  first: string;
  last: string;
}

export interface AnimeMeta {
  count: number;
}
