import client from './client';
export const getGames = () => client.get('/games').then(r => r.data);
export const getGame = (slug) => client.get(`/games/${slug}`).then(r => r.data);
