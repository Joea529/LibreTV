import type { SourceConfig } from './types';

export const BUILTIN_VOD_SOURCES: SourceConfig[] = [
  // 优质高速主流大站
  { key: 'builtin_0', name: '索尼超清', url: 'https://suoniapi.com/api.php/provide/vod' },
  { key: 'builtin_1', name: '极速秒播', url: 'https://jszyapi.com/api.php/provide/vod' },
  { key: 'builtin_2', name: '红牛高清', url: 'https://www.hongniuzy2.com/api.php/provide/vod' },
  { key: 'builtin_3', name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod' },
  { key: 'builtin_4', name: '非凡高清', url: 'https://cj.ffzyapi.com/api.php/provide/vod' },
  { key: 'builtin_5', name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod' },
  { key: 'builtin_6', name: '光速专线', url: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { key: 'builtin_7', name: '百度秒播', url: 'https://api.apibdzy.com/api.php/provide/vod' },
  // 海外、蓝光与特色专区
  { key: 'builtin_8', name: '海外看专线 (Haiwaikan)', url: 'https://haiwaikan.com/api.php/provide/vod' },
  { key: 'builtin_9', name: '优质1080P库', url: 'http://api.1080zyku.com/inc/api.php/provide/vod' },
  { key: 'builtin_10', name: '爱坤蓝光', url: 'https://ikunzyapi.com/api.php/provide/vod' },
  { key: 'builtin_11', name: '闪电专线', url: 'https://sdzyapi.com/api.php/provide/vod' },
  { key: 'builtin_12', name: '最大电影网', url: 'https://zuidazy.me/api.php/provide/vod' },
  { key: 'builtin_13', name: '樱花动漫番剧', url: 'https://m3u8.apiyhzy.com/api.php/provide/vod' },
  { key: 'builtin_14', name: 'U酷综合', url: 'https://api.ukuapi.com/api.php/provide/vod' },
  { key: 'builtin_15', name: '金鹰影视', url: 'https://jinyingzy.com/provide/vod/from/jinying/at/json' },
];

/**
 * 部署者通过 DEFAULT_SOURCES 环境变量预置的采集站。
 * 未配置环境变量时，默认返回 16 个精选高速全网与海外点播源。
 */
export function getEnvSources(): SourceConfig[] {
  const raw = process.env.DEFAULT_SOURCES;
  if (!raw || !raw.trim()) return BUILTIN_VOD_SOURCES;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组');
    const list: SourceConfig[] = parsed.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`第 ${i + 1} 项不是对象`);
      }
      const { name, url, detail, isAdult } = item as Record<string, unknown>;
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`第 ${i + 1} 项缺少 name`);
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url.trim())) {
        throw new Error(`第 ${i + 1} 项的 url 必须以 http:// 或 https:// 开头`);
      }
      return {
        key: `env_${i}`,
        name: name.trim(),
        url: url.trim().replace(/\/+$/, ''),
        detail: typeof detail === 'string' && detail.trim() ? detail.trim() : undefined,
        isAdult: isAdult === true,
      };
    });
    return list;
  } catch (err) {
    console.warn('[LibreTV] DEFAULT_SOURCES 解析失败，使用内置源：', err instanceof Error ? err.message : err);
    return BUILTIN_VOD_SOURCES;
  }
}
