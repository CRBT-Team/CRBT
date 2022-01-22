// To parse this data:
//
//   import { Convert, Anime } from "./file";
//
//   const anime = Convert.toAnime(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

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

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toAnime(json: string): Anime {
    return cast(JSON.parse(json), r('Anime'));
  }

  public static animeToJson(value: Anime): string {
    return JSON.stringify(uncast(value, r('Anime')), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
  if (key) {
    throw Error(
      `Invalid value for key "${key}". Expected type ${JSON.stringify(
        typ
      )} but got ${JSON.stringify(val)}`
    );
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.json] = { key: p.js, typ: p.typ }));
    typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
    const map: any = {};
    typ.props.forEach((p: any) => (map[p.js] = { key: p.json, typ: p.typ }));
    typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
    if (typeof typ === typeof val) return val;
    return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
    // val must validate against one typ in typs
    const l = typs.length;
    for (let i = 0; i < l; i++) {
      const typ = typs[i];
      try {
        return transform(val, typ, getProps);
      } catch (_) {}
    }
    return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
    if (cases.indexOf(val) !== -1) return val;
    return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
    // val must be an array with no invalid elements
    if (!Array.isArray(val)) return invalidValue('array', val);
    return val.map((el) => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
    if (val === null) {
      return null;
    }
    const d = new Date(val);
    if (isNaN(d.valueOf())) {
      return invalidValue('Date', val);
    }
    return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
    if (val === null || typeof val !== 'object' || Array.isArray(val)) {
      return invalidValue('object', val);
    }
    const result: any = {};
    Object.getOwnPropertyNames(props).forEach((key) => {
      const prop = props[key];
      const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
      result[prop.key] = transform(v, prop.typ, getProps, prop.key);
    });
    Object.getOwnPropertyNames(val).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(props, key)) {
        result[key] = transform(val[key], additional, getProps, key);
      }
    });
    return result;
  }

  if (typ === 'any') return val;
  if (typ === null) {
    if (val === null) return val;
    return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === 'object' && typ.ref !== undefined) {
    typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === 'object') {
    return typ.hasOwnProperty('unionMembers')
      ? transformUnion(typ.unionMembers, val)
      : typ.hasOwnProperty('arrayItems')
      ? transformArray(typ.arrayItems, val)
      : typ.hasOwnProperty('props')
      ? transformObject(getProps(typ), typ.additional, val)
      : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== 'number') return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  Anime: o(
    [
      { json: 'data', js: 'data', typ: a(r('Datum')) },
      { json: 'meta', js: 'meta', typ: r('AnimeMeta') },
      { json: 'links', js: 'links', typ: r('AnimeLinks') },
    ],
    false
  ),
  Datum: o(
    [
      { json: 'id', js: 'id', typ: '' },
      { json: 'type', js: 'type', typ: '' },
      { json: 'links', js: 'links', typ: r('DatumLinks') },
      { json: 'attributes', js: 'attributes', typ: r('Attributes') },
      { json: 'relationships', js: 'relationships', typ: m(r('Relationship')) },
    ],
    false
  ),
  Attributes: o(
    [
      { json: 'createdAt', js: 'createdAt', typ: Date },
      { json: 'updatedAt', js: 'updatedAt', typ: Date },
      { json: 'slug', js: 'slug', typ: '' },
      { json: 'synopsis', js: 'synopsis', typ: '' },
      { json: 'description', js: 'description', typ: '' },
      { json: 'coverImageTopOffset', js: 'coverImageTopOffset', typ: 0 },
      { json: 'titles', js: 'titles', typ: r('Titles') },
      { json: 'canonicalTitle', js: 'canonicalTitle', typ: '' },
      { json: 'abbreviatedTitles', js: 'abbreviatedTitles', typ: a('') },
      { json: 'averageRating', js: 'averageRating', typ: u(null, '') },
      { json: 'ratingFrequencies', js: 'ratingFrequencies', typ: m('') },
      { json: 'userCount', js: 'userCount', typ: 0 },
      { json: 'favoritesCount', js: 'favoritesCount', typ: 0 },
      { json: 'startDate', js: 'startDate', typ: u(Date, null) },
      { json: 'endDate', js: 'endDate', typ: u(Date, null) },
      { json: 'nextRelease', js: 'nextRelease', typ: null },
      { json: 'popularityRank', js: 'popularityRank', typ: 0 },
      { json: 'ratingRank', js: 'ratingRank', typ: u(0, null) },
      { json: 'ageRating', js: 'ageRating', typ: '' },
      { json: 'ageRatingGuide', js: 'ageRatingGuide', typ: '' },
      { json: 'subtype', js: 'subtype', typ: '' },
      { json: 'status', js: 'status', typ: '' },
      { json: 'tba', js: 'tba', typ: u(null, '') },
      { json: 'posterImage', js: 'posterImage', typ: r('PosterImage') },
      { json: 'coverImage', js: 'coverImage', typ: u(r('CoverImage'), null) },
      { json: 'episodeCount', js: 'episodeCount', typ: u(0, null) },
      { json: 'episodeLength', js: 'episodeLength', typ: u(0, null) },
      { json: 'totalLength', js: 'totalLength', typ: u(0, null) },
      { json: 'youtubeVideoId', js: 'youtubeVideoId', typ: u(null, '') },
      { json: 'showType', js: 'showType', typ: '' },
      { json: 'nsfw', js: 'nsfw', typ: true },
    ],
    false
  ),
  CoverImage: o(
    [
      { json: 'tiny', js: 'tiny', typ: '' },
      { json: 'large', js: 'large', typ: '' },
      { json: 'small', js: 'small', typ: '' },
      { json: 'original', js: 'original', typ: '' },
      { json: 'meta', js: 'meta', typ: r('CoverImageMeta') },
    ],
    false
  ),
  CoverImageMeta: o([{ json: 'dimensions', js: 'dimensions', typ: r('PurpleDimensions') }], false),
  PurpleDimensions: o(
    [
      { json: 'tiny', js: 'tiny', typ: r('Large') },
      { json: 'large', js: 'large', typ: r('Large') },
      { json: 'small', js: 'small', typ: r('Large') },
    ],
    false
  ),
  Large: o(
    [
      { json: 'width', js: 'width', typ: u(0, null) },
      { json: 'height', js: 'height', typ: u(0, null) },
    ],
    false
  ),
  PosterImage: o(
    [
      { json: 'tiny', js: 'tiny', typ: '' },
      { json: 'large', js: 'large', typ: '' },
      { json: 'small', js: 'small', typ: '' },
      { json: 'medium', js: 'medium', typ: '' },
      { json: 'original', js: 'original', typ: '' },
      { json: 'meta', js: 'meta', typ: r('PosterImageMeta') },
    ],
    false
  ),
  PosterImageMeta: o([{ json: 'dimensions', js: 'dimensions', typ: r('FluffyDimensions') }], false),
  FluffyDimensions: o(
    [
      { json: 'tiny', js: 'tiny', typ: r('Large') },
      { json: 'large', js: 'large', typ: r('Large') },
      { json: 'small', js: 'small', typ: r('Large') },
      { json: 'medium', js: 'medium', typ: r('Large') },
    ],
    false
  ),
  Titles: o(
    [
      { json: 'en', js: 'en', typ: u(undefined, '') },
      { json: 'en_jp', js: 'en_jp', typ: '' },
      { json: 'en_us', js: 'en_us', typ: u(undefined, '') },
      { json: 'ja_jp', js: 'ja_jp', typ: '' },
    ],
    false
  ),
  DatumLinks: o([{ json: 'self', js: 'self', typ: '' }], false),
  Relationship: o([{ json: 'links', js: 'links', typ: r('RelationshipLinks') }], false),
  RelationshipLinks: o(
    [
      { json: 'self', js: 'self', typ: '' },
      { json: 'related', js: 'related', typ: '' },
    ],
    false
  ),
  AnimeLinks: o(
    [
      { json: 'first', js: 'first', typ: '' },
      { json: 'last', js: 'last', typ: '' },
    ],
    false
  ),
  AnimeMeta: o([{ json: 'count', js: 'count', typ: 0 }], false),
};
