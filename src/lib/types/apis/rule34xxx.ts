export interface Yamlr34 {
  _declaration: Declaration;
  posts: Posts;
}

export interface Declaration {
  _attributes: DeclarationAttributes;
}

export interface DeclarationAttributes {
  version: string;
  encoding: string;
}

export interface Posts {
  _attributes: PostsAttributes;
  post: Post[];
}

export interface PostsAttributes {
  count: string;
  offset: string;
}

export interface Post {
  _attributes: PostAttributes;
}

export interface PostAttributes {
  height: string;
  score: string;
  file_url: string;
  parent_id: string;
  sample_url: string;
  sample_width: string;
  sample_height: string;
  preview_url: string;
  rating: Rating;
  tags: string;
  id: string;
  width: string;
  change: string;
  md5: string;
  creator_id: string;
  has_children: string;
  created_at: string;
  status: Status;
  source: string;
  has_notes: string;
  has_comments: string;
  preview_width: string;
  preview_height: string;
}

export enum Rating {
  E = 'e',
  Q = 'q',
}

export enum Status {
  Active = 'active',
}
