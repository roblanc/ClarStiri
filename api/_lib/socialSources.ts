import { RSSNewsItem, NewsSource } from './shared.js';

export interface SocialChannelConfig {
  id: string;
  name: string;
  platform: 'telegram' | 'substack' | 'instagram';
  handle: string;
  url: string;
  bias: 'left' | 'center-left' | 'center' | 'center-right' | 'right';
  factuality: 'high' | 'mixed' | 'low';
}

export const SOCIAL_NEWS_CHANNELS: SocialChannelConfig[] = [
  {
    id: 'misreport_substack',
    name: 'Misreport (Ovidiu Vanghele)',
    platform: 'substack',
    handle: 'misreport',
    url: 'https://misreport.substack.com/feed',
    bias: 'center',
    factuality: 'high'
  },
  {
    id: 'pressone_newsletter',
    name: 'PressOne Focus',
    platform: 'substack',
    handle: 'pressone',
    url: 'https://pressone.substack.com/feed',
    bias: 'center-left',
    factuality: 'high'
  }
];

/**
 * Preluare știri din canale publice Telegram (https://t.me/s/{channel})
 * Permite agregarea știrilor de la canale independente fără rate-limits sau chei API.
 */
export async function fetchTelegramChannelNews(channelHandle: string, sourceMeta: Partial<NewsSource>): Promise<RSSNewsItem[]> {
  try {
    const cleanHandle = channelHandle.replace('@', '').trim();
    const url = `https://t.me/s/${cleanHandle}`;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; thesite-social-bot/1.0)' }
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const html = await res.text();

    const items: RSSNewsItem[] = [];
    const messageBlocks = html.split('tgme_widget_message_wrap');

    for (const block of messageBlocks.slice(1, 10)) {
      const textMatch = block.match(/<div class="[^"]*tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      const linkMatch = block.match(/href="(https:\/\/t\.me\/[^"]+)"/i);
      const imgMatch = block.match(/background-image:url\('([^']+)'\)/i);
      const timeMatch = block.match(/datetime="([^"]+)"/i);

      if (textMatch && linkMatch) {
        const rawText = textMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        if (rawText.length < 30) continue; // Skip scurte sau mesaje de status

        const title = rawText.length > 120 ? rawText.substring(0, 117) + '...' : rawText;
        const pubDate = timeMatch ? timeMatch[1] : new Date().toISOString();

        items.push({
          id: `tg-${cleanHandle}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title,
          description: rawText,
          link: linkMatch[1],
          pubDate,
          imageUrl: imgMatch ? imgMatch[1] : undefined,
          source: {
            id: `tg_${cleanHandle}`,
            name: sourceMeta.name || `@${cleanHandle} (Telegram)`,
            url: `https://t.me/${cleanHandle}`,
            rssUrl: url,
            bias: sourceMeta.bias || 'center',
            factuality: sourceMeta.factuality || 'high',
            category: 'independent'
          },
          category: 'Social Media'
        });
      }
    }

    return items;
  } catch {
    return [];
  }
}
