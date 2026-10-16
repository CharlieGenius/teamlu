import { getUser } from '@netlify/identity';
import { eq, and } from 'drizzle-orm';
import { database } from '../../db/index.js';
import { pageContent } from '../../db/schema.js';
import type { Config } from '@netlify/functions';
function validContent(c: any): boolean {
  const str = (s: any) => typeof s === 'string' && s.length <= 10000;
  const num = (n: any) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1000;
  const list = (a: any, f: (v: any) => boolean) => Array.isArray(a) && a.length <= 300 && a.every(v => v && typeof v === 'object' && f(v));
  const id = (s: any) => s === undefined || typeof s === 'string' && /^[a-f0-9-]{36}$/.test(s);
  const image = (s: any) => typeof s === 'string' && /^\/api\/images\?key=[a-f0-9-]{36}\.(png|jpeg|webp)$/.test(s);
  const date = (s: any) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
  return !!c && typeof c === 'object' && c.copy && typeof c.copy === 'object' && !Array.isArray(c.copy)
    && Object.keys(c.copy).length <= 200 && Object.entries(c.copy).every(([k,v]) => /^copy-\d+$/.test(k) && str(v))
    && (c.images === undefined || c.images && typeof c.images === 'object' && !Array.isArray(c.images) && Object.entries(c.images).every(([k,v]) => ['plate','prize','team','hero','avatar'].includes(k) && image(v)))
    && c.progress && num(c.progress.total) && Number.isInteger(c.progress.total) && c.progress.total > 0 && num(c.progress.achieved) && c.progress.achieved <= c.progress.total && num(c.progress.newStars) && c.progress.newStars <= c.progress.achieved
    && list(c.personas, p => id(p.id) && str(p.nombre) && (!p.icono || p.icono === 'aguila') && list(p.historial, h => date(h.fecha) && (!h.nota || str(h.nota)) && list(h.objetivos, o => str(o.texto) && (!o.tag || str(o.tag)))))
    && list(c.eagle, p => id(p.profileId) && str(p.nombre) && num(p.estrellas) && p.estrellas <= 7 && Number.isInteger(p.estrellas) && (p.brillan === undefined || num(p.brillan) && p.brillan <= p.estrellas))
    && list(c.contest, p => id(p.profileId) && str(p.nombre) && num(p.aviones) && p.aviones <= 14 && Number.isInteger(p.aviones) && (p.brillan === undefined || num(p.brillan) && p.brillan <= p.aviones))
    && list(c.events, e => date(e.start) && (!e.end || date(e.end) && e.end >= e.start) && str(e.title) && str(e.short) && str(e.time) && ['ssa','genius','oneshot','hito','master','salida'].includes(e.type));
}
export default async (req: Request) => {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    if (req.method === 'GET') {
      const [row] = await database().select().from(pageContent).where(eq(pageContent.id, 1));
      return Response.json(row || { content: null, revision: 0 }, { headers });
    }
    if (req.method !== 'PUT') return new Response('Method not allowed', { status: 405 });
    if (req.headers.get('origin') !== new URL(req.url).origin) return new Response('Forbidden', { status: 403 });
    const user = await getUser();
    if (!user?.roles?.includes('admin')) return Response.json({ error: 'Se requiere una cuenta con rol admin.' }, { status: 403, headers });
    const raw = await req.text();
    if (raw.length > 1000000) return new Response('Contenido demasiado grande', { status: 413 });
    const { content, revision } = JSON.parse(raw);
    if (!validContent(content) || !Number.isInteger(revision) || revision < 0) return Response.json({ error: 'Revisa los datos: fechas, límites y campos obligatorios.' }, { status: 400, headers });
    const db = database();
    const rows = revision === 0
      ? await db.insert(pageContent).values({ id: 1, content, revision: 1 }).onConflictDoNothing().returning()
      : await db.update(pageContent).set({ content, revision: revision + 1, updatedAt: new Date() }).where(and(eq(pageContent.id, 1), eq(pageContent.revision, revision))).returning();
    if (!rows.length) return Response.json({ error: 'Otra sesión publicó cambios. Recarga el editor antes de publicar.' }, { status: 409, headers });
    return Response.json({ revision: rows[0].revision }, { headers });
  } catch {
    return Response.json({ error: 'No se ha podido guardar o cargar el contenido. Inténtalo de nuevo.' }, { status: 503, headers });
  }
};
export const config: Config = { path: '/api/content' };
