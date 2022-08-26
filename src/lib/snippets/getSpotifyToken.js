import 'dotenv/config';
import { fetch, Headers } from 'undici';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

async function getSpotifyToken() {
  const req = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: new Headers({
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    body: new URLSearchParams({
      grant_type: 'client_credentials',
    }),
  });

  console.log(await req.json());
}

getSpotifyToken();
