from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from app import db
from app.models.usuario import Usuario
from app.utils.decorators import admin_required

usuarios_bp = Blueprint('usuarios', __name__)


@usuarios_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Listar usuarios',
    'description': 'Obtener lista paginada de usuarios (Solo Admin)',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'rol', 'in': 'query', 'type': 'string', 'enum': ['admin', 'logistica', 'cobranza', 'publicidad', 'cliente']},
        {'name': 'tipo_usuario', 'in': 'query', 'type': 'string', 'enum': ['regular', 'adulto_mayor', 'discapacitado']}
    ],
    'responses': {
        200: {'description': 'Lista de usuarios'},
        403: {'description': 'No autorizado'}
    }
})
def get_usuarios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    rol = request.args.get('rol')
    tipo = request.args.get('tipo_usuario')
    
    query = Usuario.query
    
    if rol:
        query = query.filter_by(rol=rol)
    if tipo:
        query = query.filter_by(tipo_usuario=tipo)
    
    usuarios = query.order_by(Usuario.fecha_registro.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'usuarios': [u.to_dict() for u in usuarios.items],
        'total': usuarios.total,
        'pages': usuarios.pages,
        'current_page': page
    }), 200


@usuarios_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Obtener usuario por ID',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Usuario encontrado'}, 404: {'description': 'No encontrado'}}
})
def get_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    return jsonify(usuario.to_dict()), 200


@usuarios_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Crear usuario',
    'description': 'Registrar nuevo usuario con rol asignado (HU-01)',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body', 'in': 'body', 'required': True,
        'schema': {
            'type': 'object',
            'required': ['nombre', 'apellido', 'cedula', 'email', 'username', 'password'],
            'properties': {
                'nombre': {'type': 'string', 'example': 'Juan'},
                'apellido': {'type': 'string', 'example': 'Pérez'},
                'cedula': {'type': 'string', 'example': 'V-12345678'},
                'email': {'type': 'string', 'example': 'juan@email.com'},
                'username': {'type': 'string', 'example': 'juanperez'},
                'password': {'type': 'string', 'example': 'password123'},
                'rol': {'type': 'string', 'enum': ['admin', 'logistica', 'cobranza', 'publicidad', 'cliente']},
                'tipo_usuario': {'type': 'string', 'enum': ['regular', 'adulto_mayor', 'discapacitado']}
            }
        }
    }],
    'responses': {201: {'description': 'Usuario creado'}, 400: {'description': 'Error de validación'}}
})
def create_usuario():
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
        'message': 'Usuario creado exitosamente',
        'usuario': usuario.to_dict()
    }), 201


@usuarios_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Actualizar usuario',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object', 'properties': {
            'nombre': {'type': 'string'}, 'apellido': {'type': 'string'},
            'email': {'type': 'string'}, 'telefono': {'type': 'string'},
            'rol': {'type': 'string'}, 'tipo_usuario': {'type': 'string'},
            'activo': {'type': 'boolean'}, 'password': {'type': 'string'}
        }}}
    ],
    'responses': {200: {'description': 'Usuario actualizado'}, 400: {'description': 'Error'}}
})
def update_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    data = request.get_json()
    
    if 'email' in data and data['email'] != usuario.email:
        if Usuario.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        usuario.email = data['email']
    
    if 'cedula' in data and data['cedula'] != usuario.cedula:
        if Usuario.query.filter_by(cedula=data['cedula']).first():
            return jsonify({'error': 'La cédula ya está registrada'}), 400
        usuario.cedula = data['cedula']
    
    usuario.nombre = data.get('nombre', usuario.nombre)
    usuario.apellido = data.get('apellido', usuario.apellido)
    usuario.telefono = data.get('telefono', usuario.telefono)
    usuario.direccion = data.get('direccion', usuario.direccion)
    usuario.tipo_usuario = data.get('tipo_usuario', usuario.tipo_usuario)
    usuario.rol = data.get('rol', usuario.rol)
    usuario.activo = data.get('activo', usuario.activo)
    
    if 'password' in data and data['password']:
        usuario.set_password(data['password'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Usuario actualizado exitosamente',
        'usuario': usuario.to_dict()
    }), 200


@usuarios_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Desactivar usuario',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Usuario desactivado'}, 400: {'description': 'Error'}}
})
def delete_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    current_user_id = int(get_jwt_identity())
    
    if usuario.id == current_user_id:
        return jsonify({'error': 'No puede eliminar su propio usuario'}), 400
    
    usuario.activo = False
    db.session.commit()
    
    return jsonify({'message': 'Usuario desactivado exitosamente'}), 200


@usuarios_bp.route('/<int:id>/activate', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Activar usuario',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Usuario activado'}}
})
def activate_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    usuario.activo = True
    db.session.commit()
    
    return jsonify({
        'message': 'Usuario activado exitosamente',
        'usuario': usuario.to_dict()
    }), 200


@usuarios_bp.route('/<int:id>/eliminar', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Usuarios'],
    'summary': 'Eliminar usuario permanentemente',
    'description': 'Elimina físicamente un usuario de la base de datos',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Usuario eliminado'}, 400: {'description': 'Error'}}
})
def eliminar_usuario(id):
    usuario = Usuario.query.get_or_404(id)
    current_user_id = int(get_jwt_identity())
    
    if usuario.id == current_user_id:
        return jsonify({'error': 'No puede eliminar su propio usuario'}), 400
    
    try:
        db.session.delete(usuario)
        db.session.commit()
        return jsonify({'message': 'Usuario eliminado permanentemente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'No se puede eliminar. Tiene registros asociados.'}), 400
