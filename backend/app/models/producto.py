from app import db
from datetime import datetime


class Producto(db.Model):
    __tablename__ = 'productos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text)
    precio_compra = db.Column(db.Numeric(10, 2), nullable=False)
    precio_venta = db.Column(db.Numeric(10, 2), nullable=False)
    unidad_medida = db.Column(db.String(20), default='unidad')
    categoria = db.Column(db.String(50))
    
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=False)
    
    activo = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    inventario = db.relationship('Inventario', backref='producto', uselist=False)
    combo_productos = db.relationship('ComboProducto', backref='producto', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'precio_compra': float(self.precio_compra) if self.precio_compra else 0,
            'precio_venta': float(self.precio_venta) if self.precio_venta else 0,
            'unidad_medida': self.unidad_medida,
            'categoria': self.categoria,
            'proveedor_id': self.proveedor_id,
            'proveedor_nombre': self.proveedor.nombre if self.proveedor else None,
            'activo': self.activo,
            'stock_actual': self.inventario.cantidad if self.inventario else 0
        }
    
    def __repr__(self):
        return f'<Producto {self.nombre}>'
