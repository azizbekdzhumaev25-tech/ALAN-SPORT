import { getImageFromStore } from "@/lib/site";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Защита от Path Traversal (запрещаем символы пути .. / \)
  if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return new Response("Invalid filename", { status: 400 });
  }

  const imgData = getImageFromStore(filename);

  if (!imgData) {
    return new Response("Image not found", { status: 404 });
  }

  return new Response(new Uint8Array(imgData.buffer), {
    headers: {
      "Content-Type": imgData.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}