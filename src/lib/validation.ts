import { sanitizeText } from "./sanitize";

// Проверка: это точно картинка или безопасная ссылка?
export function isValidImage(url: string | null | undefined): boolean {
  if (!url) return true; // Разрешаем пустые (если фото удалили)
  if (url.startsWith("http://") || url.startsWith("https://")) return true;
  if (url.startsWith("data:image/jpeg;base64,")) return true;
  if (url.startsWith("data:image/png;base64,")) return true;
  if (url.startsWith("data:image/webp;base64,")) return true;
  // Запрещаем всё остальное (javascript:, SVG со скриптами, HTML и вирусы)
  return false;
}

// Защита от огромных файлов и вредоносного кода
export function checkMaliciousPayload(body: any) {
  if (!body) return;

  const MAX_IMAGE_SIZE = 7_000_000; // ~5 Мегабайт (с учётом Base64 кодирования)
  const MAX_TEXT_SIZE = 10_000;     // Защита от спама текстом на тысячи страниц

  if (body.name && body.name.length > MAX_TEXT_SIZE) throw new Error("Nom juda uzun!");
  if (body.description && body.description.length > MAX_TEXT_SIZE) throw new Error("Tavsif juda uzun!");

  // Автоматическая очистка текстовых полей от опасных скриптов (XSS)
  if (body.name) body.name = sanitizeText(body.name);
  if (body.description) body.description = sanitizeText(body.description);
  if (body.promoTag) body.promoTag = sanitizeText(body.promoTag);
  if (body.category) body.category = sanitizeText(body.category);

  const images = [];
  if (typeof body.image === "string") images.push(body.image);
  if (typeof body.sizeGuide === "string") images.push(body.sizeGuide);
  if (Array.isArray(body.images)) images.push(...body.images);

  for (const img of images) {
    if (typeof img !== "string") continue;
    
    // Блокируем слишком тяжелые файлы (защита оперативной памяти сервера)
    if (img.length > MAX_IMAGE_SIZE) {
      throw new Error("Rasm hajmi juda katta (Maksimum 5MB). Iltimos, hajmini kichraytiring.");
    }
    
    // Блокируем XSS атаки
    if (!isValidImage(img)) {
      throw new Error("Xavfsizlik: Faqat JPG, PNG, WEBP rasmlar yoki ishonchli havolalar ruxsat etiladi!");
    }
  }
}