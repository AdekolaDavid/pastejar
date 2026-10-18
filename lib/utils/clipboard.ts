import * as Clipboard from 'expo-clipboard';
import type { ClipType } from '@/types/supabase';

const URL_REGEX =
  /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

const CODE_INDICATORS = [
  /^(import|export|const|let|var|function|class|interface|type)\s/m,
  /[{}();]\s*$/m,
  /=>\s*[{(]/m,
  /<\/?[a-zA-Z][a-zA-Z0-9]*[\s>]/,
];

/** Auto-detect the clip type from raw content. */
export function detectClipType(content: string): ClipType {
  const trimmed = content.trim();

  if (URL_REGEX.test(trimmed)) return 'link';
  if (CODE_INDICATORS.some((r) => r.test(trimmed))) return 'code';

  return 'text';
}

/** Read the current clipboard text. */
export async function readClipboard(): Promise<string> {
  return Clipboard.getStringAsync();
}

/** Write text to the clipboard. */
export async function writeClipboard(text: string): Promise<void> {
  await Clipboard.setStringAsync(text);
}

/** Truncate long content for preview display. */
export function truncate(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
