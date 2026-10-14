import type { LiveSourceConfig } from './types';

export const BUILTIN_LIVE_SOURCES: LiveSourceConfig[] = [
  {
    key: 'builtin_live_0',
    name: '国内综合电视 (CDN 加速)',
    url: 'https://testingcf.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u',
    epg: 'https://live.fanmingming.com/e.xml',
  },
  {
    key: 'builtin_live_1',
    name: 'IPv6 超清央视卫视',
    url: 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
    epg: 'https://live.fanmingming.com/e.xml',
  },
  {
    key: 'builtin_live_2',
    name: 'IPTV-Org 中国精选频道',
    url: 'https://iptv-org.github.io/iptv/countries/cn.m3u',
  },
  {
    key: 'builtin_live_3',
    name: '全国广播电台收音机',
    url: 'https://live.fanmingming.com/radio/m3u/index.m3u',
  },
];

/**
 * 部署者通过 DEFAULT_LIVE_SOURCES 环境变量预置的直播源（M3U 订阅）。
 * 格式为 JSON 数组：[{"name":"源名","url":"https://.../list.m3u","epg":"https://.../epg.xml.gz"}]
 * 未配置环境变量时，默认返回高质量内置电视直播源。
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
