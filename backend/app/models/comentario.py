from app import db
from datetime import datetime


class Comentario(db.Model):
    __tablename__ = 'comentarios'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    
    contenido = db.Column(db.Text, nullable=False)
    calificacion = db.Column(db.Integer)  # 1-5 estrellas
    
    # Categoría: servicio, productos, atencion, general
    categoria = db.Column(db.String(30), default='general')
    
    # Estado: pendiente, aprobado, rechazado
    estado = db.Column(db.String(20), default='pendiente')
    
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'usuario_nombre': f"{self.usuario.nombre} {self.usuario.apellido}" if self.usuario else None,
            'contenido': self.contenido,
            'calificacion': self.calificacion,
            'categoria': self.categoria,
            'estado': self.estado,
            'fecha_creacion': self.fecha_creacion.isoformat() if self.fecha_creacion else None
        }
    
    def __repr__(self):
        return f'<Comentario {self.id}>'
