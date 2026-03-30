import {
  formatDistanceToNow,
  differenceInMinutes,
  format,
} from "date-fns";
import { ja } from "date-fns/locale";

/**
 * チャット一覧向けの相対時間表示
 * - 1分未満: 「たった今」
 * - 24時間以内: 「3分前」「2時間前」等
 * - 今年: 「3/30 14:00」
 * - 去年以前: 「2025/3/30」
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffMin = differenceInMinutes(now, date);

  if (diffMin < 1) return "たった今";

  if (diffMin < 60 * 24) {
    return formatDistanceToNow(date, { addSuffix: true, locale: ja });
  }

  if (date.getFullYear() === now.getFullYear()) {
    return format(date, "M/d H:mm");
  }

  return format(date, "yyyy/M/d");
}
