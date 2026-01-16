from app import db
from datetime import datetime
import random
import string


def generar_numero_retiro():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))


class Retiro(db.Model):
    __tablename__ = 'retiros'
    
    id = db.Column(db.Integer, primary_key=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'), nullable=False)
    
    numero_retiro = db.Column(db.String(20), unique=True, nullable=False)
    numero_cola = db.Column(db.Integer, nullable=False)
    
    fecha_retiro_programada = db.Column(db.DateTime, nullable=False)
    fecha_retiro_real = db.Column(db.DateTime)
    
    # Estado: programado, en_cola, retirado, no_presentado
    estado = db.Column(db.String(20), default='programado')
    
    # Cola según tipo de usuario (prioridad para adultos mayores y discapacitados)
    tipo_cola = db.Column(db.String(20), default='regular')
    
    atendido_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    notas = db.Column(db.Text)
    
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationship
    atendedor = db.relationship('Usuario', foreign_keys=[atendido_por])
    
    def to_dict(self):
        return {
            'id': self.id,
            'compra_id': self.compra_id,
            'numero_retiro': self.numero_retiro,
            'numero_cola': self.numero_cola,
            'fecha_retiro_programada': self.fecha_retiro_programada.isoformat() if self.fecha_retiro_programada else None,
            'fecha_retiro_real': self.fecha_retiro_real.isoformat() if self.fecha_retiro_real else None,
            'estado': self.estado,
            'tipo_cola': self.tipo_cola,
            'atendido_por': self.atendido_por,
            'notas': self.notas
        }
    
    def __repr__(self):
        return f'<Retiro {self.numero_retiro}>'
