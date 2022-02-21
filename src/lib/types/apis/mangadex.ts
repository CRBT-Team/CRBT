export interface Manga {
  result: string;
  response: string;
  data: Datum[];
  limit: number;
  offset: number;
  total: number;
}

export interface Datum {
  id: string;
  type: RelationshipType;
  attributes: DatumAttributes;
  relationships: Relationship[];
}

export interface DatumAttributes {
  title: Title;
  altTitles: { [key: string]: string }[];
  description: Description;
  isLocked: boolean;
  links: { [key: string]: string };
  originalLanguage: string;
  lastVolume: string;
  lastChapter: string;
  publicationDemographic: string;
  status: string;
  year: number | null;
  contentRating: string;
  tags: Tag[];
  state: string;
  chapterNumbersResetOnNewVolume: boolean;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface Description {
  en: string;
  fr?: string;
  it?: string;
  ru?: string;
  pt?: string;
}

export interface Tag {
  id: string;
  type: TagType;
  attributes: TagAttributes;
  relationships: any[];
}

export interface TagAttributes {
  name: Title;
  description: any[];
  group: Group;
  version: number;
}

export enum Group {
  Format = 'format',
  Genre = 'genre',
  Theme = 'theme',
}

export interface Title {
  en: string;
}

export enum TagType {
  Tag = 'tag',
}

export interface Relationship {
  id: string;
  type: RelationshipType;
  related?: string;
}

export enum RelationshipType {
  Artist = 'artist',
  Author = 'author',
  CoverArt = 'cover_art',
  Manga = 'manga',
}
