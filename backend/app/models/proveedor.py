from app import db
from datetime import datetime


class Proveedor(db.Model):
    __tablename__ = 'proveedores'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    rif = db.Column(db.String(20), unique=True, nullable=False)
    direccion = db.Column(db.Text)
    telefono = db.Column(db.String(20))
    email = db.Column(db.String(120))
    persona_contacto = db.Column(db.String(100))
    tiempo_entrega_dias = db.Column(db.Integer, default=1)
    
    activo = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    productos = db.relationship('Producto', backref='proveedor', lazy='dynamic')
    pedidos = db.relationship('PedidoProveedor', backref='proveedor', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'rif': self.rif,
            'direccion': self.direccion,
            'telefono': self.telefono,
            'email': self.email,
            'persona_contacto': self.persona_contacto,
            'tiempo_entrega_dias': self.tiempo_entrega_dias,
            'activo': self.activo,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
    
    def __repr__(self):
        return f'<Proveedor {self.nombre}>'
