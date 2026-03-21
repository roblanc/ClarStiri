import { fetchRSSFeed, NEWS_SOURCES } from './api/shared.js';
async function run() {
  const rs = await fetchRSSFeed(NEWS_SOURCES[0]);
  console.log(rs.length);
}
run();
