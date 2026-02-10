import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors
let resendInstance: Resend | null = null;

export const getResend = (): Resend => {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('Warning: RESEND_API_KEY is not set');
      throw new Error('RESEND_API_KEY is required');
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
};

// Email templates
export const templates = {
  welcomeMember: (params: {
    fullName: string;
    activationLink: string;
  }) => ({
    subject: 'Bienvenido a Club Haltère - Activa tu cuenta',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenido a Club Haltère</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 20px 0 40px;">
              <div style="font-size: 28px; font-weight: 700; color: #d4af37; letter-spacing: 4px;">
                HALTÈRE
              </div>
              <div style="font-size: 12px; color: #666666; letter-spacing: 2px; margin-top: 4px;">
                PRIVATE CLUB
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #111111; border-radius: 16px; padding: 40px; border: 1px solid #222222;">
              <h1 style="margin: 0 0 24px; color: #ffffff; font-size: 24px; font-weight: 600; text-align: center;">
                ¡Bienvenido, ${params.fullName}!
              </h1>
              
              <p style="margin: 0 0 24px; color: #999999; font-size: 16px; line-height: 1.6; text-align: center;">
                Tu solicitud ha sido <strong style="color: #22c55e;">aprobada</strong>. Ya eres miembro oficial de Club Haltère.
              </p>
              
              <p style="margin: 0 0 32px; color: #999999; font-size: 16px; line-height: 1.6; text-align: center;">
                Para acceder a tu panel de miembro, configura tu contraseña haciendo click en el botón:
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="${params.activationLink}" style="display: inline-block; background-color: #d4af37; color: #0a0a0a; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Activar mi cuenta
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 32px 0 0; color: #666666; font-size: 14px; line-height: 1.6; text-align: center;">
                Este enlace expira en 24 horas. Si no solicitaste esto, ignora este email.
              </p>
            </td>
          </tr>
          
          <!-- Benefits Section -->
          <tr>
            <td style="padding: 32px 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="background-color: #111111; border-radius: 12px; padding: 24px; border: 1px solid #222222;">
                    <h2 style="margin: 0 0 16px; color: #d4af37; font-size: 16px; font-weight: 600;">
                      Lo que te espera:
                    </h2>
                    <ul style="margin: 0; padding: 0 0 0 20px; color: #999999; font-size: 14px; line-height: 2;">
                      <li>Acceso exclusivo a nuestras instalaciones</li>
                      <li>Reserva de sesiones con profesionales</li>
                      <li>Seguimiento de tu progreso con Technogym</li>
                      <li>Wallet digital para bonos y servicios</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 0; text-align: center;">
              <p style="margin: 0; color: #666666; font-size: 12px;">
                © ${new Date().getFullYear()} Club Haltère. Todos los derechos reservados.
              </p>
              <p style="margin: 8px 0 0; color: #666666; font-size: 12px;">
                Lo Barnechea, Santiago, Chile
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }),
};