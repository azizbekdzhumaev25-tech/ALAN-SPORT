// Очищает текст от HTML тегов и опасных скриптов
export function sanitizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    // Удаляем все HTML теги (<script>, <iframe...>)
    .replace(/<[^>]*>?/gm, "")
    // Заменяем опасные кавычки и скобки
    .replace(/javascript:/gi, "")
    .trim();
}