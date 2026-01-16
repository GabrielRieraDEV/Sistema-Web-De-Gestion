from app import db
from datetime import datetime


class Pago(db.Model):
    __tablename__ = 'pagos'
    
    id = db.Column(db.Integer, primary_key=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'), nullable=False)
    
    # Método: pago_movil, transferencia
    metodo_pago = db.Column(db.String(20), nullable=False)
    
    # Datos del pago
    numero_referencia = db.Column(db.String(50), nullable=False)
    banco_origen = db.Column(db.String(100))
    telefono_pago = db.Column(db.String(20))  # Para pago móvil
    monto = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Estado: pendiente, verificado, rechazado
    estado = db.Column(db.String(20), default='pendiente')
    
    # Verificación
    verificado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    fecha_verificacion = db.Column(db.DateTime)
    notas_verificacion = db.Column(db.Text)
    
    fecha_pago = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    verificador = db.relationship('Usuario', foreign_keys=[verificado_por])
    
    def to_dict(self):
        return {
            'id': self.id,
            'compra_id': self.compra_id,
            'metodo_pago': self.metodo_pago,
            'numero_referencia': self.numero_referencia,
            'banco_origen': self.banco_origen,
            'telefono_pago': self.telefono_pago,
            'monto': float(self.monto) if self.monto else 0,
            'estado': self.estado,
            'verificado_por': self.verificado_por,
            'verificador_nombre': f"{self.verificador.nombre} {self.verificador.apellido}" if self.verificador else None,
            'fecha_verificacion': self.fecha_verificacion.isoformat() if self.fecha_verificacion else None,
            'notas_verificacion': self.notas_verificacion,
            'fecha_pago': self.fecha_pago.isoformat() if self.fecha_pago else None
        }
    
    def __repr__(self):
        return f'<Pago {self.id} - {self.numero_referencia}>'
