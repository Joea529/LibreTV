'use client';

import { Icon } from '@/components/icon';
import { useAppStore } from '@/lib/store';

export interface OverseasVerifiedSource {
  key: string;
  name: string;
  tag: string;
  speed: string;
  resolution: string;
  url: string;
}

export const VERIFIED_OVERSEAS_SOURCES: OverseasVerifiedSource[] = [
  {
    key: 'builtin_10',
    name: '爱坤蓝光',
    tag: '全球 CDN 节点',
    speed: '~320ms',
    resolution: '4K/1080P',
    url: 'https://ikunzyapi.com/api.php/provide/vod',
  },
  {
    key: 'builtin_6',
    name: '光速专线',
    tag: '欧美直连专线',
    speed: '~310ms',
    resolution: '1080P 超清',
    url: 'https://api.guangsuapi.com/api.php/provide/vod',
  },
  {
    key: 'builtin_2',
    name: '红牛高清',
    tag: '跨国高可用',
    speed: '~350ms',
    resolution: '1080P 蓝光',
    url: 'https://www.hongniuzy2.com/api.php/provide/vod',
  },
];

interface OverseasSourceBannerProps {
  onRetryWithOverseas?: () => void;
}

export function OverseasSourceBanner({ onRetryWithOverseas }: OverseasSourceBannerProps) {
  const setSelectedKeys = useAppStore((s) => s.setSelectedKeys);

  const handleApplyOverseasOnly = () => {
    // 自动在 store 中只勾选已验证的海外直连源
    const verifiedKeys = VERIFIED_OVERSEAS_SOURCES.map((s) => s.key);
    setSelectedKeys(verifiedKeys);
    if (onRetryWithOverseas) {
      onRetryWithOverseas();
    }
  };

  return (
    <div className="mb-3 rounded-xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/20 via-chip to-chip p-3.5 shadow-sm transition-all duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            海外直连保障 · 视频切片已通过实测播放验证
          </span>
          <span className="hidden sm:inline text-[11px] text-faint">
            (部分国内源超时或拦截时，推荐使用海外直连专线)
          </span>
        </div>

        {onRetryWithOverseas && (
          <button
            type="button"
            onClick={handleApplyOverseasOnly}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors"
          >
            <Icon name="bolt" className="w-3.5 h-3.5 text-emerald-400" />
            一键优先使用海外专线
          </button>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap gap-2">
        {VERIFIED_OVERSEAS_SOURCES.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 text-xs border border-line"
          >
            <span className="font-medium text-content">{item.name}</span>
            <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] text-emerald-400 font-mono">
              {item.tag}
            </span>
            <span className="text-[10px] text-faint">{item.resolution}</span>
            <span className="text-[10px] text-emerald-500/80">{item.speed}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
