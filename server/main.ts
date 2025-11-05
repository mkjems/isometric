// Main Deno server for isometric multiplayer game
// Phase 1: Basic static file server

const PORT = 8000;

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function getContentType(path: string): string {
  const ext = path.substring(path.lastIndexOf("."));
  return MIME_TYPES[ext] || "application/octet-stream";
}

async function serveStaticFile(filePath: string): Promise<Response> {
  try {
    const file = await Deno.readFile(filePath);
    const contentType = getContentType(filePath);

    return new Response(file, {
      status: 200,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return new Response("File not found", { status: 404 });
  }
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  let pathname = url.pathname;

  console.log(`${req.method} ${pathname}`);

  // Default to index.html for root
  if (pathname === "/") {
    pathname = "/index.html";
  }

  // Construct file path (serve from dist directory)
  const filePath = `./dist${pathname}`;

  return await serveStaticFile(filePath);
}

function startServer() {
  console.log(`🚀 Starting Isometric Game Server...`);
  console.log(`📁 Serving static files from: ./dist/`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log(`\nPress Ctrl+C to stop\n`);

  Deno.serve({ port: PORT }, handleRequest);
}

// Start the server
startServer();
