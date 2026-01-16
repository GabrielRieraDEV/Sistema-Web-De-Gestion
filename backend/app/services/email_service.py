from flask import current_app
from flask_mail import Message
from app import mail


def enviar_notificacion_pago(email, nombre, numero_retiro, numero_cola, fecha_retiro, tipo_cola):
    """Enviar notificación de pago verificado con datos de retiro (HU-09)"""
    
    prioridad_texto = "PRIORITARIO" if tipo_cola == 'prioritario' else "Regular"
    
    asunto = f"CECOALIMENTOS - Confirmación de Pago - Retiro #{numero_retiro}"
    
    cuerpo = f"""
    Estimado/a {nombre},

    ¡Su pago ha sido verificado exitosamente!

    A continuación, los detalles para el retiro de su combo:

    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    NÚMERO DE RETIRO: {numero_retiro}
    NÚMERO DE COLA: {numero_cola}
    TIPO DE COLA: {prioridad_texto}
    FECHA DE RETIRO: {fecha_retiro.strftime('%d/%m/%Y')}
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    INSTRUCCIONES:
    1. Preséntese en la fecha indicada con su número de retiro.
    2. Diríjase a la cola correspondiente según su tipo.
    3. Tenga a mano su cédula de identidad.
    4. Espere su turno según el número de cola asignado.

    Si tiene alguna pregunta, no dude en contactarnos.

    Atentamente,
    Cooperativa CECOALIMENTOS
    """
    
    try:
        msg = Message(
            subject=asunto,
            recipients=[email],
            body=cuerpo
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Error enviando email a {email}: {str(e)}")
        return False


def enviar_recordatorio_retiro(email, nombre, numero_retiro, fecha_retiro):
    """Enviar recordatorio de retiro pendiente"""
    
    asunto = f"CECOALIMENTOS - Recordatorio de Retiro #{numero_retiro}"
    
    cuerpo = f"""
    Estimado/a {nombre},

    Le recordamos que tiene un retiro pendiente:

    NÚMERO DE RETIRO: {numero_retiro}
    FECHA DE RETIRO: {fecha_retiro.strftime('%d/%m/%Y')}

    No olvide presentarse con su número de retiro y cédula de identidad.

    Atentamente,
    Cooperativa CECOALIMENTOS
    """
    
    try:
        msg = Message(
            subject=asunto,
            recipients=[email],
            body=cuerpo
        )
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Error enviando recordatorio a {email}: {str(e)}")
        return False
