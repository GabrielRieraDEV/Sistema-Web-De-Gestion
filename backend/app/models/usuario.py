from app import db
from datetime import datetime
import bcrypt


class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    apellido = db.Column(db.String(100), nullable=False)
    cedula = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefono = db.Column(db.String(20))
    direccion = db.Column(db.Text)
    
    # Tipo de usuario: adulto_mayor, discapacitado, regular
    tipo_usuario = db.Column(db.String(20), default='regular')
    
    # Rol: admin, logistica, cobranza, publicidad, cliente
    rol = db.Column(db.String(20), default='cliente')
    
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    activo = db.Column(db.Boolean, default=True)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    compras = db.relationship('Compra', backref='usuario', lazy='dynamic')
    comentarios = db.relationship('Comentario', backref='usuario', lazy='dynamic')
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(
            password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'), 
            self.password_hash.encode('utf-8')
        )
    
    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'cedula': self.cedula,
            'email': self.email,
            'telefono': self.telefono,
            'direccion': self.direccion,
            'tipo_usuario': self.tipo_usuario,
            'rol': self.rol,
            'username': self.username,
            'activo': self.activo,
            'fecha_registro': self.fecha_registro.isoformat() if self.fecha_registro else None
        }
    
    def __repr__(self):
        return f'<Usuario {self.username}>'
