import type { LiveSourceConfig } from './types';

export const BUILTIN_LIVE_SOURCES: LiveSourceConfig[] = [
  // 国内综合与超清
  {
    key: 'builtin_live_0',
    name: '国内综合电视 (CDN全球加速)',
    url: 'https://testingcf.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u',
    epg: 'https://live.fanmingming.com/e.xml',
  },
  {
    key: 'builtin_live_1',
    name: 'IPv6 4K超清央视卫视',
    url: 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
    epg: 'https://live.fanmingming.com/e.xml',
  },
  // 全球海外与特色专区
  {
    key: 'builtin_live_2',
    name: 'APTV 全球华语与海外精选',
    url: 'https://testingcf.jsdelivr.net/gh/Kimentanm/aptv@master/m3u/iptv.m3u',
  },
  {
    key: 'builtin_live_3',
    name: '全球电影专线 (IPTV-Org Movies)',
    url: 'https://iptv-org.github.io/iptv/categories/movies.m3u',
  },
  {
    key: 'builtin_live_4',
    name: '全球动漫少儿频道 (Animation)',
    url: 'https://iptv-org.github.io/iptv/categories/animation.m3u',
  },
  {
    key: 'builtin_live_5',
    name: '全球纪录片频道 (Documentary)',
    url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u',
  },
  {
    key: 'builtin_live_6',
    name: '香港特区频道 (Hong Kong)',
    url: 'https://iptv-org.github.io/iptv/countries/hk.m3u',
  },
  {
    key: 'builtin_live_7',
    name: '台湾精选频道 (Taiwan)',
    url: 'https://iptv-org.github.io/iptv/countries/tw.m3u',
  },
  {
    key: 'builtin_live_8',
    name: '美国精选频道 (United States)',
    url: 'https://iptv-org.github.io/iptv/countries/us.m3u',
  },
  {
    key: 'builtin_live_9',
    name: '全国广播电台收音机',
    url: 'https://live.fanmingming.com/radio/m3u/index.m3u',
  },
];

/**
 * 部署者通过 DEFAULT_LIVE_SOURCES 环境变量预置的直播源（M3U 订阅）。
 * 未配置环境变量时，默认返回 10 个精选全网与全球电视直播源。
 */
export function getEnvLiveSources(): LiveSourceConfig[] {
  const raw = process.env.DEFAULT_LIVE_SOURCES;
  if (!raw || !raw.trim()) return BUILTIN_LIVE_SOURCES;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组');
    const list: LiveSourceConfig[] = parsed.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`第 ${i + 1} 项不是对象`);
      }
      const { name, url, epg } = item as Record<string, unknown>;
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`第 ${i + 1} 项缺少 name`);
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url.trim())) {
        throw new Error(`第 ${i + 1} 项的 url 必须以 http:// 或 https:// 开头`);
      }
      return {
        key: `envlive_${i}`,
        name: name.trim(),
        url: url.trim().replace(/\/+$/, ''),
        epg: typeof epg === 'string' && epg.trim() ? epg.trim() : undefined,
      };
    });
    return list;
  } catch (err) {
    console.warn('[LibreTV] DEFAULT_LIVE_SOURCES 解析失败，使用内置源：', err instanceof Error ? err.message : err);
    return BUILTIN_LIVE_SOURCES;
  }
}
