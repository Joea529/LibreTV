import type { SourceConfig } from './types';

export const BUILTIN_VOD_SOURCES: SourceConfig[] = [
  { key: 'builtin_0', name: '索尼资源', url: 'https://suoniapi.com/api.php/provide/vod' },
  { key: 'builtin_1', name: '极速资源', url: 'https://jszyapi.com/api.php/provide/vod' },
  { key: 'builtin_2', name: '红牛资源', url: 'https://www.hongniuzy2.com/api.php/provide/vod' },
  { key: 'builtin_3', name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod' },
  { key: 'builtin_4', name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { key: 'builtin_5', name: '百度资源', url: 'https://api.apibdzy.com/api.php/provide/vod' },
  { key: 'builtin_6', name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod' },
  { key: 'builtin_7', name: '非凡资源', url: 'https://cj.ffzyapi.com/api.php/provide/vod' },
  { key: 'builtin_8', name: '樱花动漫', url: 'https://m3u8.apiyhzy.com/api.php/provide/vod' },
  { key: 'builtin_9', name: 'U酷资源', url: 'https://api.ukuapi.com/api.php/provide/vod' },
  { key: 'builtin_10', name: '金鹰资源', url: 'https://jinyingzy.com/provide/vod/from/jinying/at/json' },
];

/**
 * 部署者通过 DEFAULT_SOURCES 环境变量预置的采集站。
 * 格式为 JSON 数组：[{"name":"源名","url":"https://.../api.php/provide/vod","detail":"https://...","isAdult":false}]
 * 未配置环境变量时，默认返回高质量内置采集源。
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
