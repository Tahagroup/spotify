interface Album {
  album: AlbumDetail;
  musics: Music[];
  length: number;
}

interface Music {
  id: number;
  track_name: string;
  track_time: string;
  track_url: string;
  track_thumb: string;
  is_favorited: number;
  like_status: string;
  nonce: string;
}

interface AlbumDetail {
  id: string;
  album_name: string;
  album_composer: string;
  album_genre: string;
  album_thumb: string;
  album_url: string;
}
