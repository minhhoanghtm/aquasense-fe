/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu, viết thường
 */
export const removeVietnameseTones = (str: string): string => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .trim();
};

/**
 * Kiểm tra xem chuỗi text có chứa từ khóa query (hỗ trợ cả có dấu và không dấu)
 */
export const matchVietnamese = (
  text: string | null | undefined,
  query: string | null | undefined
): boolean => {
  if (!text || !query) return false;
  const rawText = text.toLowerCase();
  const rawQuery = query.toLowerCase().trim();

  // Khớp trực tiếp (có dấu)
  if (rawText.includes(rawQuery)) return true;

  // Khớp không dấu
  const cleanText = removeVietnameseTones(text);
  const cleanQuery = removeVietnameseTones(query);
  return cleanText.includes(cleanQuery);
};
