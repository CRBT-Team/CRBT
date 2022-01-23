export interface Urban {
  list: List[];
}

export interface List {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: Word;
  defid: number;
  current_vote: string;
  written_on: Date;
  example: string;
  thumbs_down: number;
}

export enum Word {
  Word = 'word',
}
