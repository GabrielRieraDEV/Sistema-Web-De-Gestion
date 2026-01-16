from app import db
from datetime import datetime


class PedidoProveedor(db.Model):
    __tablename__ = 'pedidos_proveedor'
    
    id = db.Column(db.Integer, primary_key=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable=False)
    
    # Estado: pendiente, confirmado, en_transito, recibido, cancelado
    estado = db.Column(db.String(20), default='pendiente')
    
    total = db.Column(db.Numeric(10, 2), default=0)
    notas = db.Column(db.Text)
    
    fecha_pedido = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_entrega_esperada = db.Column(db.DateTime)
    fecha_entrega_real = db.Column(db.DateTime)
    
    creado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'))
    
    # Relationships
    detalles = db.relationship('DetallePedidoProveedor', backref='pedido', lazy='dynamic', cascade='all, delete-orphan')
    
    def to_dict(self, include_detalles=True):
        data = {
            'id': self.id,
            'proveedor_id': self.proveedor_id,
            'proveedor_nombre': self.proveedor.nombre if self.proveedor else None,
            'estado': self.estado,
            'total': float(self.total) if self.total else 0,
            'notas': self.notas,
            'fecha_pedido': self.fecha_pedido.isoformat() if self.fecha_pedido else None,
            'fecha_entrega_esperada': self.fecha_entrega_esperada.isoformat() if self.fecha_entrega_esperada else None,
            'fecha_entrega_real': self.fecha_entrega_real.isoformat() if self.fecha_entrega_real else None
        }
        if include_detalles:
            data['detalles'] = [d.to_dict() for d in self.detalles]
        return data
    
    def __repr__(self):
        return f'<PedidoProveedor {self.id}>'


class DetallePedidoProveedor(db.Model):
    __tablename__ = 'detalle_pedidos_proveedor'
    
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedidos_proveedor.id'), nullable=False)
    producto_id = db.Column(db.Integer, db.ForeignKey('productos.id'), nullable=False)
    cantidad = db.Column(db.Integer, nullable=False)
    precio_unitario = db.Column(db.Numeric(10, 2), nullable=False)
    subtotal = db.Column(db.Numeric(10, 2), nullable=False)
    
    # Relationship
    producto = db.relationship('Producto')
    
    def to_dict(self):
        return {
            'id': self.id,
            'producto_id': self.producto_id,
            'producto_nombre': self.producto.nombre if self.producto else None,
            'cantidad': self.cantidad,
            'precio_unitario': float(self.precio_unitario) if self.precio_unitario else 0,
            'subtotal': float(self.subtotal) if self.subtotal else 0
        }
    
    def __repr__(self):
        return f'<DetallePedidoProveedor pedido={self.pedido_id} producto={self.producto_id}>'
