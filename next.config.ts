import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // 1. Запрещаем встраивать сайт в iframe (защита от Clickjacking)
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // 2. Блокируем подмену типов файлов браузером (MIME Sniffing)
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // 3. Защита от утечки ссылок переходa
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // 4. Отключаем доступ к микрофону и камере если кто-то попытается встроить вредоносный скрипт
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;