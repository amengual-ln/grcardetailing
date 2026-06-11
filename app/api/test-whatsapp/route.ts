import { NextResponse } from 'next/server'
import { enviarRecordatorio } from '@/lib/whatsapp'

export async function GET() {
  const resultado = await enviarRecordatorio({
    clienteNombre: 'Test Usuario',
    clienteTelefono: process.env.TWILIO_TEST_PHONE || 'whatsapp:+5491112345678',
    fecha: '09/06/2026',
    hora: '15:00',
    servicios: ['Prueba de conexión Twilio'],
  })

  return NextResponse.json({
    success: resultado,
    message: resultado
      ? 'Mensaje enviado correctamente'
      : 'No se pudo enviar. Verificá las variables de entorno.',
  })
}