from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from app.models.usuario import Usuario


def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_user_id = get_jwt_identity()
            usuario = Usuario.query.get(current_user_id)
            
            if not usuario:
                return jsonify({'error': 'Usuario no encontrado'}), 404
            
            if usuario.rol not in roles:
                return jsonify({'error': 'No tiene permisos para realizar esta acción'}), 403
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def admin_required(f):
    return roles_required('admin')(f)


def logistica_required(f):
    return roles_required('admin', 'logistica')(f)


def cobranza_required(f):
    return roles_required('admin', 'cobranza')(f)


def publicidad_required(f):
    return roles_required('admin', 'publicidad')(f)
