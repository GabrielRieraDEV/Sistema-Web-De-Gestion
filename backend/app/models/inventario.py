from app import db
from datetime import datetime


class Inventario(db.Model):
    __tablename__ = 'inventario'
    
    id = db.Column(db.Integer, primary_key=True)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False, unique=True)
    
    cantidad = db.Column(db.Integer, default=0)
    cantidad_minima = db.Column(db.Integer, default=10)
    
    ultima_entrada = db.Column(db.DateTime)
    ultima_salida = db.Column(db.DateTime)
    
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'cantidad': self.cantidad,
            'cantidad_minima': self.cantidad_minima,
            'bajo_stock': self.cantidad < self.cantidad_minima,
            'ultima_entrada': self.ultima_entrada.isoformat() if self.ultima_entrada else None,
            'ultima_salida': self.ultima_salida.isoformat() if self.ultima_salida else None
        }
    
    def __repr__(self):
        return f'<Inventario producto={self.producto_id} cantidad={self.cantidad}>'
