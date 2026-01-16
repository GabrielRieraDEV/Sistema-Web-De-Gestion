from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flasgger import swag_from
from app import db
from app.models.proveedor import Proveedor
from app.utils.decorators import admin_required

proveedores_bp = Blueprint('proveedores', __name__)


@proveedores_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Listar proveedores',
    'description': 'Obtener lista de proveedores (HU-02)',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'activo', 'in': 'query', 'type': 'boolean'}
    ],
    'responses': {200: {'description': 'Lista de proveedores'}}
})
def get_proveedores():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    activo = request.args.get('activo', type=lambda x: x.lower() == 'true')
    
    query = Proveedor.query
    
    if activo is not None:
        query = query.filter_by(activo=activo)
    
    proveedores = query.order_by(Proveedor.nombre).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'proveedores': [p.to_dict() for p in proveedores.items],
        'total': proveedores.total,
        'pages': proveedores.pages,
        'current_page': page
    }), 200


@proveedores_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Obtener proveedor por ID',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Proveedor con sus productos'}}
})
def get_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    data = proveedor.to_dict()
    data['productos'] = [p.to_dict() for p in proveedor.productos.filter_by(activo=True)]
    return jsonify(data), 200


@proveedores_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Registrar proveedor',
    'description': 'Registrar proveedor con productos y tiempos de entrega (HU-02)',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body', 'in': 'body', 'required': True,
        'schema': {
            'type': 'object',
            'required': ['nombre', 'rif'],
            'properties': {
                'nombre': {'type': 'string', 'example': 'Distribuidora Central'},
                'rif': {'type': 'string', 'example': 'J-12345678-9'},
                'direccion': {'type': 'string'},
                'telefono': {'type': 'string'},
                'email': {'type': 'string'},
                'persona_contacto': {'type': 'string'},
                'tiempo_entrega_dias': {'type': 'integer', 'default': 1}
            }
        }
    }],
    'responses': {201: {'description': 'Proveedor registrado'}}
})
def create_proveedor():
    data = request.get_json()
    
    required_fields = ['nombre', 'rif']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} es requerido'}), 400
    
    if Proveedor.query.filter_by(rif=data['rif']).first():
        return jsonify({'error': 'El RIF ya está registrado'}), 400
    
    proveedor = Proveedor(
        nombre=data['nombre'],
        rif=data['rif'],
        direccion=data.get('direccion'),
        telefono=data.get('telefono'),
        email=data.get('email'),
        persona_contacto=data.get('persona_contacto'),
        tiempo_entrega_dias=data.get('tiempo_entrega_dias', 1)
    )
    
    db.session.add(proveedor)
    db.session.commit()
    
    return jsonify({
        'message': 'Proveedor registrado exitosamente',
        'proveedor': proveedor.to_dict()
    }), 201


@proveedores_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Actualizar proveedor',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object'}}
    ],
    'responses': {200: {'description': 'Proveedor actualizado'}}
})
def update_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    data = request.get_json()
    
    if 'rif' in data and data['rif'] != proveedor.rif:
        if Proveedor.query.filter_by(rif=data['rif']).first():
            return jsonify({'error': 'El RIF ya está registrado'}), 400
        proveedor.rif = data['rif']
    
    proveedor.nombre = data.get('nombre', proveedor.nombre)
    proveedor.direccion = data.get('direccion', proveedor.direccion)
    proveedor.telefono = data.get('telefono', proveedor.telefono)
    proveedor.email = data.get('email', proveedor.email)
    proveedor.persona_contacto = data.get('persona_contacto', proveedor.persona_contacto)
    proveedor.tiempo_entrega_dias = data.get('tiempo_entrega_dias', proveedor.tiempo_entrega_dias)
    proveedor.activo = data.get('activo', proveedor.activo)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Proveedor actualizado exitosamente',
        'proveedor': proveedor.to_dict()
    }), 200


@proveedores_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Desactivar proveedor',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Proveedor desactivado'}}
})
def delete_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    proveedor.activo = False
    db.session.commit()
    
    return jsonify({'message': 'Proveedor desactivado exitosamente'}), 200


@proveedores_bp.route('/<int:id>/activate', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Activar proveedor',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Proveedor activado'}}
})
def activate_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    proveedor.activo = True
    db.session.commit()
    return jsonify({'message': 'Proveedor activado', 'proveedor': proveedor.to_dict()}), 200


@proveedores_bp.route('/<int:id>/eliminar', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Proveedores'],
    'summary': 'Eliminar proveedor permanentemente',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Proveedor eliminado'}, 400: {'description': 'Error'}}
})
def eliminar_proveedor(id):
    proveedor = Proveedor.query.get_or_404(id)
    try:
        db.session.delete(proveedor)
        db.session.commit()
        return jsonify({'message': 'Proveedor eliminado permanentemente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'No se puede eliminar. Tiene productos asociados.'}), 400
