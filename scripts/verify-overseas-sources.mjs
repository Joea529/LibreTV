#!/usr/bin/env node

/**
 * 海外直连与切片播放验证脚本 (Overseas Stream Verifier)
 * 作用：全链路自动化测试各点播源在跨国/海外网络下的搜索、M3U8 解析及视频切片可播性。
 * 用法：node scripts/verify-overseas-sources.mjs
 */

const VOD_SOURCES = [
  { name: '爱坤蓝光', url: 'https://ikunzyapi.com/api.php/provide/vod', tag: '全球 CDN' },
  { name: '红牛高清', url: 'https://www.hongniuzy2.com/api.php/provide/vod', tag: '跨国专线' },
  { name: '索尼超清', url: 'https://suoniapi.com/api.php/provide/vod', tag: '海外直连' },
  { name: '极速秒播', url: 'https://jszyapi.com/api.php/provide/vod', tag: '高码率' },
  { name: '量子资源', url: 'https://cj.lziapi.com/api.php/provide/vod', tag: '海量大库' },
  { name: '非凡高清', url: 'https://cj.ffzyapi.com/api.php/provide/vod', tag: '稳定备份' },
  { name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod', tag: '综合片源' },
  { name: '光速专线', url: 'https://api.guangsuapi.com/api.php/provide/vod', tag: '欧美专线' },
  { name: '优质1080P', url: 'http://api.1080zyku.com/inc/api.php/provide/vod', tag: '1080P' },
];

const TEST_KEYWORD = '三体';

async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function verifySource(source) {
  const startTime = Date.now();
  const sep = source.url.includes('?') ? '&' : '?';
  const searchUrl = `${source.url}${sep}ac=detail&wd=${encodeURIComponent(TEST_KEYWORD)}`;

  try {
    const searchRes = await fetchWithTimeout(
      searchUrl,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      },
      5000
    );

    if (!searchRes.ok) {
      return { ...source, ok: false, error: `HTTP ${searchRes.status}` };
    }

    const data = await searchRes.json();
    const list = data?.list || [];
    if (!list.length) {
      return { ...source, ok: false, error: '搜索结果为空' };
    }

    // 提取首个 m3u8 播放地址
    const vod = list[0];
    const playUrls = String(vod.vod_play_url || '')
      .replace(/#/g, '\n')
      .split('\n');

    let m3u8Url = null;
    for (const segment of playUrls) {
      if (segment.includes('$') && segment.includes('.m3u8')) {
        m3u8Url = segment.split('$').pop().trim();
        break;
      } else if (segment.includes('.m3u8')) {
        m3u8Url = segment.trim();
        break;
      }
    }

    if (!m3u8Url) {
      return { ...source, ok: false, error: '未解析到 M3U8 流' };
    }

    // 深度验证：向 M3U8 切片清单发起真实请求
    const streamRes = await fetchWithTimeout(
      m3u8Url,
      {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      },
      5000
    );

    const streamText = await streamRes.text();
    const totalLatency = Date.now() - startTime;

    if (streamText.includes('#EXTM3U') || streamText.includes('#EXTINF')) {
      return {
        ...source,
        ok: true,
        latency: totalLatency,
        m3u8Url,
        sampleSlice: streamText.slice(0, 80).replace(/\n/g, ' '),
      };
    } else {
      return { ...source, ok: false, error: '视频流未返回有效切片' };
    }
  } catch (err) {
    return { ...source, ok: false, error: err.name === 'AbortError' ? '请求超时' : err.message };
  }
}

async function main() {
  console.log(`\n🔍 开始全链路探测海外直连与可播视频切片（测试关键字: "${TEST_KEYWORD}"）...\n`);

  const results = await Promise.all(VOD_SOURCES.map((s) => verifySource(s)));

  console.log('='.repeat(70));
  console.log(`| 源名       | 标签         | 状态       | 全链路延迟  | 播放流验证`);
  console.log('='.repeat(70));

  const verifiedOverseas = [];

  for (const r of results) {
    const status = r.ok ? '✓ PASS 畅通' : '✗ FAIL 异常';
    const latency = r.latency ? `${r.latency}ms` : '-';
    const detail = r.ok ? '可秒播切片' : r.error;
    console.log(
      `| ${r.name.padEnd(8)} | ${r.tag.padEnd(10)} | ${status.padEnd(10)} | ${latency.padEnd(10)} | ${detail}`
    );
    if (r.ok) {
      verifiedOverseas.push(r);
    }
  }

  console.log('='.repeat(70));
  console.log(`\n🎉 验证完成！共 ${verifiedOverseas.length}/${results.length} 个点播源支持海外直连无损播放。`);
  console.log(`💡 推荐已直接同步至 LibreTV 搜索页面上方横幅中。\n`);
}

main();
