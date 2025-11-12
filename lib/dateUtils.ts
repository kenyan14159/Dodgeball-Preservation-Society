/**
 * 日付を日本語形式にフォーマットする
 * @param dateString YYYY-MM-DD形式の日付文字列
 * @returns 日本語形式の日付文字列（例: "2003年4月13日"）
 */
export function formatBirthday(dateString: string | undefined): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString + "T00:00:00");
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // 無効な日付の場合はnullを返す
    if (isNaN(date.getTime())) {
      return null;
    }

    return `${year}年${month}月${day}日`;
  } catch {
    return null;
  }
}

