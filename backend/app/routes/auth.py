from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity
)
from flasgger import swag_from
from app import db
from app.models.usuario import Usuario

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Registrar nuevo usuario',
    'description': 'Registro de usuarios en el sistema (HU-01)',
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'required': ['nombre', 'apellido', 'cedula', 'email', 'username', 'password'],
            'properties': {
                'nombre': {'type': 'string', 'example': 'Juan'},
                'apellido': {'type': 'string', 'example': 'Pérez'},
                'cedula': {'type': 'string', 'example': 'V-12345678'},
                'email': {'type': 'string', 'example': 'juan@email.com'},
                'telefono': {'type': 'string', 'example': '0412-1234567'},
                'direccion': {'type': 'string', 'example': 'Ciudad Bolívar'},
                'tipo_usuario': {'type': 'string', 'enum': ['regular', 'adulto_mayor', 'discapacitado']},
                'username': {'type': 'string', 'example': 'juanperez'},
                'password': {'type': 'string', 'example': 'mipassword123'}
            }
        }
    }],
    'responses': {
        201: {'description': 'Usuario registrado exitosamente'},
        400: {'description': 'Error de validación'}
    }
})
def register():
    data = request.get_json()
    
    required_fields = ['nombre', 'apellido', 'cedula', 'email', 'username', 'password']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} es requerido'}), 400
    
    if Usuario.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'El nombre de usuario ya existe'}), 400
    
    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'El email ya está registrado'}), 400
    
    if Usuario.query.filter_by(cedula=data['cedula']).first():
        return jsonify({'error': 'La cédula ya está registrada'}), 400
    
    usuario = Usuario(
        nombre=data['nombre'],
        apellido=data['apellido'],
        cedula=data['cedula'],
        email=data['email'],
        telefono=data.get('telefono'),
        direccion=data.get('direccion'),
        tipo_usuario=data.get('tipo_usuario', 'regular'),
        rol=data.get('rol', 'cliente'),
        username=data['username']
    )
    usuario.set_password(data['password'])
    
    db.session.add(usuario)
    db.session.commit()
    
    return jsonify({
        'message': 'Usuario registrado exitosamente',
        'usuario': usuario.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
@swag_from({
    'tags': ['Auth'],
    'summary': 'Iniciar sesión',
    'description': 'Autenticación de usuarios (HU-06)',
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'required': ['username', 'password'],
            'properties': {
                'username': {'type': 'string', 'example': 'admin'},
                'password': {'type': 'string', 'example': 'admin123'}
            }
        }
    }],
    'responses': {
        200: {'description': 'Login exitoso, retorna tokens JWT'},
        401: {'description': 'Credenciales inválidas'}
    }
})
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    usuario = Usuario.query.filter_by(username=data['username']).first()
    
    if not usuario or not usuario.check_password(data['password']):
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    if not usuario.activo:
        return jsonify({'error': 'Usuario inactivo'}), 401
    
    access_token = create_access_token(identity=str(usuario.id))
    refresh_token = create_refresh_token(identity=str(usuario.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'usuario': usuario.to_dict()
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@swag_from({
    'tags': ['Auth'],
    'summary': 'Refrescar token de acceso',
    'description': 'Obtener nuevo access_token usando refresh_token',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Nuevo access_token generado'},
        401: {'description': 'Token inválido'}
    }
})
def refresh():
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=current_user_id)
    return jsonify({'access_token': access_token}), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Auth'],
    'summary': 'Obtener usuario actual',
    'description': 'Retorna información del usuario autenticado',
    'security': [{'Bearer': []}],
    'responses': {
        200: {'description': 'Datos del usuario'},
        404: {'description': 'Usuario no encontrado'}
    }
})
def get_current_user():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify(usuario.to_dict()), 200


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Auth'],
    'summary': 'Cambiar contraseña',
    'description': 'Cambiar la contraseña del usuario autenticado',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body',
        'in': 'body',
        'required': True,
        'schema': {
            'type': 'object',
            'required': ['current_password', 'new_password'],
            'properties': {
                'current_password': {'type': 'string'},
                'new_password': {'type': 'string'}
            }
        }
    }],
    'responses': {
        200: {'description': 'Contraseña actualizada'},
        400: {'description': 'Error de validación'}
    }
})
def change_password():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    data = request.get_json()
    
    if not usuario.check_password(data.get('current_password', '')):
        return jsonify({'error': 'Contraseña actual incorrecta'}), 400
    
    if not data.get('new_password'):
        return jsonify({'error': 'Nueva contraseña es requerida'}), 400
    
    usuario.set_password(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Contraseña actualizada exitosamente'}), 200
