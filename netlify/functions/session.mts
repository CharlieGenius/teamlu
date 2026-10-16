import { login, logout, getUser, requestPasswordRecovery, acceptInvite, recoverPassword, MissingIdentityError } from '@netlify/identity';
import type { Config } from '@netlify/functions';
export default async (req: Request) => {
  const headers = { 'Cache-Control': 'no-store' };
  let action: unknown;
  try {
    if (req.method === 'GET') {
      const user = await getUser();
      return Response.json({ authenticated: !!user, canEdit: !!user?.roles?.includes('admin') }, { headers });
    }
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    if (req.headers.get('origin') !== new URL(req.url).origin) return Response.json({ error: 'La solicitud debe realizarse desde este sitio. Abre el editor de nuevo y reinténtalo.' }, { status: 403, headers });
    const body = await req.json();
    action = body.action;
    if (body.action === 'login') await login(body.email, body.password);
    else if (body.action === 'logout') await logout();
    else if (body.action === 'recover') {
      if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return Response.json({ error: 'Introduce un correo electrónico válido.' }, { status: 400, headers });
      await requestPasswordRecovery(body.email.trim());
      return Response.json({ ok: true }, { headers });
    }
    else if (body.action === 'invite' || body.action === 'reset') {
      if (typeof body.token !== 'string' || !body.token || typeof body.password !== 'string' || body.password.length < 8) return Response.json({ error: 'Abre el enlace del correo e introduce una contraseña de al menos 8 caracteres.' }, { status: 400, headers });
      const user = body.action === 'invite' ? await acceptInvite(body.token, body.password) : await recoverPassword(body.token, body.password);
      // These SDK operations redeem the link but do not set server-side cookies.
      // Sign in explicitly to establish the browser session through the runtime.
      await login(user.email, body.password);
    }
    else return new Response('Invalid action', { status: 400 });
    const user = await getUser();
    return Response.json({ ok: true, canEdit: !!user?.roles?.includes('admin') }, { headers });
  } catch (error) {
    // Inspect provider errors only to select fixed messages; never expose their payloads.
    const failure = error as { status?: number; message?: string; cause?: { status?: number; json?: { msg?: string; error_description?: string } } };
    const code = failure?.status ?? failure?.cause?.status;
    const detail = `${failure?.message || ''} ${failure?.cause?.json?.msg || ''} ${failure?.cause?.json?.error_description || ''}`;
    let message = 'No se ha podido completar la solicitud. Comprueba tus datos o solicita un nuevo enlace.';
    let status = 400;
    if (error instanceof MissingIdentityError || code === 404) {
      message = 'El servicio de acceso no está disponible en este sitio. Revisa que Identity esté activado en el proyecto de Netlify.'; status = 503;
    } else if (code === 429 || /rate.?limit|too many|once every|security purposes/i.test(detail)) {
      message = 'Se han solicitado demasiados correos. Espera unos minutos antes de volver a intentarlo.'; status = 429;
    } else if (code && code >= 500) {
      message = action === 'recover' ? 'El servicio no ha podido enviar el correo. Revisa la configuración de correo de Identity en Netlify y vuelve a intentarlo.' : 'El servicio de acceso no está disponible temporalmente. Inténtalo de nuevo más tarde.'; status = 503;
    } else if (/expired|invalid.*token|token.*invalid|otp_expired/i.test(detail)) {
      message = 'El enlace ha caducado o ya se ha utilizado. Solicita un correo nuevo y abre únicamente el enlace más reciente.';
    } else if (/password/i.test(detail) && code === 422) {
      message = 'La contraseña no cumple los requisitos. Usa al menos 8 caracteres y prueba una contraseña más segura.';
    }
    return Response.json({ error: message }, { status, headers });
  }
};
export const config: Config = { path: '/api/session' };
