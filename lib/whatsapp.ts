/**
 * WhatsApp notifications via Twilio
 * Configurar TWILIO_* variables en .env cuando esté listo
 */

interface TurnoData {
  clienteNombre: string
  clienteTelefono: string
  fecha: string
  hora: string
  servicios: string[]
}

export async function enviarRecordatorio(turno: TurnoData): Promise<boolean> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM } = process.env

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM) {
    console.log('[WhatsApp] Variables no configuradas. Recordatorio simulado para:', turno.clienteNombre)
    return false
  }

  const mensaje = buildMensajeRecordatorio(turno)
  const to = `whatsapp:${turno.clienteTelefono.replace(/\s/g, '')}`

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: TWILIO_WHATSAPP_FROM, To: to, Body: mensaje }),
      }
    )
    const data = await response.json()
    if (!response.ok) {
      console.error('[WhatsApp] Error Twilio:', data)
      return false
    }
    console.log('[WhatsApp] Enviado:', data.sid)
    return true
  } catch (err) {
    console.error('[WhatsApp] Error de red:', err)
    return false
  }
}

function buildMensajeRecordatorio(turno: TurnoData): string {
  const serviciosList = turno.servicios.map(s => `🔧 *${s}*`).join('\n')
  return `Hola ${turno.clienteNombre.split(' ')[0]}! 👋

Te recuerdo que mañana tenés turno en *GR Car Detailing*:

🗓 *${turno.fecha}* a las *${turno.hora}*

${serviciosList}

¿Podés confirmar asistencia? Respondé SI o NO.

Si necesitás reprogramar, avisame con anticipación.

¡Gracias! GR Car Detailing 🚗`
}
