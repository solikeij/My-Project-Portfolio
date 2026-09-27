import http from 'node:http';
import {stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.jpeg':'image/jpeg','.jfif':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.woff2':'font/woff2','.mp4':'video/mp4','.webm':'video/webm','.vtt':'text/vtt; charset=utf-8'};
http.createServer(async(req,res)=>{
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}).end(); return; }
    const url = new URL(req.url, 'http://127.0.0.1');
    const filename = path.resolve(root, '.' + decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname));
    if (!filename.startsWith(root)) {res.writeHead(403);res.end();return;}
    const file = await stat(filename);
    if (!file.isFile()) { res.writeHead(404).end(); return; }
    const headers = {'Content-Type':types[path.extname(filename).toLowerCase()] || 'application/octet-stream','Cache-Control':'no-cache','Accept-Ranges':'bytes'};
    let start = 0;
    let end = file.size - 1;
    let status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { res.writeHead(416, {'Content-Range':`bytes */${file.size}`}).end(); return; }
      if (!match[1]) start = Math.max(0, file.size - Number(match[2]));
      else { start = Number(match[1]); if (match[2]) end = Math.min(Number(match[2]), end); }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= file.size) { res.writeHead(416, {'Content-Range':`bytes */${file.size}`}).end(); return; }
      status = 206;
      headers['Content-Range'] = `bytes ${start}-${end}/${file.size}`;
    }
    headers['Content-Length'] = file.size ? end - start + 1 : 0;
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || !file.size) { res.end(); return; }
    const stream = createReadStream(filename, {start, end});
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(4173, '127.0.0.1', ()=>console.log('keij preview: http://127.0.0.1:4173'));
