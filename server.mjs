import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname } from "path";

createServer(async (request, response) => {
  console.log(request.method, request.url);

  const url = new URL(request.url, "http://dummy.base.url");
  let filePath = "./www/" + url.pathname;
  if (filePath.endsWith("/")) {
    filePath += "index.html";
  }

  const ext = extname(filePath);
  let contentType;
  switch (ext) {
    case ".html":
      contentType = "text/html; charset=utf-8";
      break;
    case ".mjs":
      contentType = "application/javascript";
      break;
    case ".ico":
      contentType = "text/html";
  }
  const headers = new Headers();

  if (ext === ".html" && !url.searchParams.has("no-link")) {
    headers.set("link", `<someLib.mjs>; rel="modulepreload"`);
  }

  try {
    const result = await readFile(filePath);
    for (const [header, value] of headers) {
      console.log(`   Setting header ${header}=${value}`);
      response.setHeader(header, value);
    }
    response.writeHead(200, { "Content-Type": contentType });
    response.end(result, "utf-8");
  } catch (e) {
    if (e.code == "ENOENT") {
      response.writeHead(404, { "Content-Type": contentType });
      response.end("File not found", "utf-8");
      console.log("Code 404, File not found");
    } else {
      response.writeHead(500);
      response.end(e.code, "utf-8");
      console.log("Code 500,", e);
    }
  }
}).listen(8125);
console.log("Server running at http://127.0.0.1:8125/");
