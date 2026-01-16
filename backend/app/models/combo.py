from app import db
from datetime import datetime


class Combo(db.Model):
    __tablename__ = 'combos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    descripcion = db.Column(db.Text)
    precio_total = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Tipo: tipo_1, tipo_2, tipo_3 (tres tipos según HU-04)
    tipo = db.Column(db.String(20), nullable=False)
    
    imagen_url = db.Column(db.String(255))
    activo = db.Column(db.Boolean, default=True)
    disponible = db.Column(db.Boolean, default=True)
    
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    productos = db.relationship('ComboProducto', backref='combo', lazy='dynamic', cascade='all, delete-orphan')
    compras = db.relationship('Compra', backref='combo', lazy='dynamic')
    
    def to_dict(self, include_productos=True):
        data = {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio_total': float(self.precio_total) if self.precio_total else 0,
            'tipo': self.tipo,
            'imagen_url': self.imagen_url,
            'activo': self.activo,
            'disponible': self.disponible,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
        if include_productos:
            data['productos'] = [cp.to_dict() for cp in self.productos]
        return data
    
    def __repr__(self):
        return f'<Combo {self.nombre}>'


class ComboProducto(db.Model):
    __tablename__ = 'combo_productos'
    
    id = db.Column(db.Integer, primary_key=True)
    combo_id = db.Column(db.Integer, db.ForeignKey('combos.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    cantidad = db.Column(db.Integer, default=1)
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'cantidad': self.cantidad,
            'precio_unitario': float(self.producto.precio_venta) if self.producto else 0
        }
    
    def __repr__(self):
        return f'<ComboProducto combo={self.combo_id} producto={self.producto_id}>'
