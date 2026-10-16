import { getStore } from '@netlify/blobs';
import { getUser } from '@netlify/identity';
import type { Config } from '@netlify/functions';

export default async (req: Request) => {
  try {
    const store = getStore({ name: 'editor-images', consistency: 'strong' });
    if (req.method === 'GET') {
      const key = new URL(req.url).searchParams.get('key') || '';
      if (!/^[a-f0-9-]{36}\.(png|jpeg|webp)$/.test(key)) return new Response('Not found', { status: 404 });
      const data = await store.get(key, { type: 'arrayBuffer' });
      if (!data) return new Response('Not found', { status: 404 });
      const ext = key.split('.').pop();
      return new Response(data, { headers: { 'Content-Type': `image/${ext}`, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' } });
    }
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (req.headers.get('origin') !== new URL(req.url).origin) return new Response('Forbidden', { status: 403 });
    const user = await getUser();
    if (!user?.roles?.includes('admin')) return Response.json({ error: 'Se requiere una cuenta con rol admin.' }, { status: 403 });
    const type = req.headers.get('content-type');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(type || '')) return Response.json({ error: 'Usa una imagen JPG, PNG o WebP.' }, { status: 400 });
    const reader = req.body?.getReader();
    if (!reader) return new Response('Empty body', { status: 400 });
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length;
      if (size > 3 * 1024 * 1024) { await reader.cancel(); return Response.json({ error: 'La imagen supera los 3 MB.' }, { status: 413 }); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const png = [137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v);
    const jpeg = bytes[0]===255 && bytes[1]===216 && bytes[2]===255;
    const webp = String.fromCharCode(...bytes.slice(0,4))==='RIFF' && String.fromCharCode(...bytes.slice(8,12))==='WEBP';
    if (!(type==='image/png' && png || type==='image/jpeg' && jpeg || type==='image/webp' && webp)) return Response.json({ error: 'El archivo no corresponde a una imagen válida.' }, { status: 400 });
    const key = `${crypto.randomUUID()}.${type!.split('/')[1]}`;
    await store.set(key, bytes.buffer);
    return Response.json({ url: `/api/images?key=${key}` }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return Response.json({ error: 'No se ha podido cargar la imagen. Inténtalo de nuevo.' }, { status: 503 }); }
};
export const config: Config = { path: '/api/images' };
