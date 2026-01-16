from app import db
from datetime import datetime


class Compra(db.Model):
    __tablename__ = 'compras'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    combo_id = db.Column(db.Integer, db.ForeignKey('combos.id'), nullable=False)
    
    # Estado: pendiente_pago, pago_verificando, pagado, listo_retiro, retirado, cancelado
    estado = db.Column(db.String(30), default='pendiente_pago')
    
    monto_total = db.Column(db.Numeric(10, 2), nullable=False)
    
    fecha_compra = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    pago = db.relationship('Pago', backref='compra', uselist=False)
    retiro = db.relationship('Retiro', backref='compra', uselist=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': f"{self.usuario.nombre} {self.usuario.apellido}" if self.usuario else None,
            'combo_id': self.combo_id,
            'combo_nombre': self.combo.nombre if self.combo else None,
            'estado': self.estado,
            'monto_total': float(self.monto_total) if self.monto_total else 0,
            'fecha_compra': self.fecha_compra.isoformat() if self.fecha_compra else None,
            'pago': self.pago.to_dict() if self.pago else None,
            'retiro': self.retiro.to_dict() if self.retiro else None
        }
    
    def __repr__(self):
        return f'<Compra {self.id}>'
