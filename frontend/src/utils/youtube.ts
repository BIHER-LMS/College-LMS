/**
 * YouTube Utility functions for LMS Video Streaming
 * Supports robust ID extraction, ad-free/privacy-enhanced embed URL generation,
 * thumbnail resolution, and metadata pre-fetching.
 */

/**
 * Extracts an 11-character YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube-nocookie.com/embed/VIDEO_ID
 */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(
    /(?:youtu\.be\/|(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|shorts\/|live\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i
  );
  return match ? match[1] : null;
}

/**
 * Validates whether a string contains a valid YouTube video ID or link
 */
export function isValidYouTubeUrl(url: string | null | undefined): boolean {
  return extractYouTubeId(url) !== null;
}

/**
 * Returns a high-res or standard thumbnail URL for a given YouTube video ID
 */
export function getYouTubeThumbnail(
  videoIdOrUrl: string | null | undefined,
  quality: 'default' | 'mq' | 'hq' | 'maxres' = 'hq'
): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl;
  if (!videoId) return '';

  const qualityMap = {
    default: 'default.jpg',
    mq: 'mqdefault.jpg',
    hq: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality] || 'hqdefault.jpg'}`;
}

/**
 * Generates an ad-free, privacy-enhanced YouTube embed URL using the
 * youtube-nocookie.com domain and educational query parameters:
 *
 * - rel=0: Suppresses non-channel related recommendations at the end of the video
 * - modestbranding=1: Suppresses YouTube logo branding in the player control bar
 * - iv_load_policy=3: Turns off pop-up video annotations and cards
 * - playsinline=1: Plays inside web container on mobile instead of opening native app
 * - enablejsapi=1: Allows JavaScript player API integration and telemetry tracking
 */
export function getAdFreeYouTubeEmbedUrl(
  videoIdOrUrl: string | null | undefined,
  options?: {
    autoplay?: boolean;
    startSeconds?: number;
    origin?: string;
    enableJsApi?: boolean;
  }
): string {
  const videoId = extractYouTubeId(videoIdOrUrl) || videoIdOrUrl;
  if (!videoId) return '';

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    playsinline: '1',
    controls: '1',
    fs: '1',
    disablekb: '0',
  });

  if (options?.autoplay) {
    params.set('autoplay', '1');
  }

  if (options?.startSeconds && options.startSeconds > 0) {
    params.set('start', String(Math.floor(options.startSeconds)));
  }

  if (options?.enableJsApi !== false) {
    params.set('enablejsapi', '1');
  }

  if (options?.origin || (typeof window !== 'undefined' && window.location.origin)) {
    const origin = options?.origin || window.location.origin;
    params.set('origin', origin);
  }

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/**
 * Attempts to fetch video metadata (Title, Author) via YouTube's public oEmbed service
 */
export async function fetchYouTubeMetadata(
  urlOrId: string
): Promise<{ title?: string; authorName?: string; thumbnailUrl?: string } | null> {
  const videoId = extractYouTubeId(urlOrId);
  if (!videoId) return null;

  try {
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(targetUrl)}&format=json`;
    const res = await fetch(endpoint, { method: 'GET', mode: 'cors' });
    if (!res.ok) return null;

    const data = await res.json();
    return {
      title: data.title,
      authorName: data.author_name,
      thumbnailUrl: data.thumbnail_url || getYouTubeThumbnail(videoId, 'hq'),
    };
  } catch (err) {
    return null;
  }
}
