from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flasgger import swag_from
from app import db
from app.models.combo import Combo, ComboProducto
from app.models.producto import Producto
from app.utils.decorators import logistica_required

combos_bp = Blueprint('combos', __name__)


@combos_bp.route('/', methods=['GET'])
@swag_from({
    'tags': ['Combos'],
    'summary': 'Listar combos disponibles',
    'description': 'Endpoint público para ver combos disponibles (HU-05). No requiere autenticación.',
    'parameters': [{
        'name': 'disponibles',
        'in': 'query',
        'type': 'boolean',
        'default': True,
        'description': 'Filtrar solo combos disponibles'
    }],
    'responses': {
        200: {'description': 'Lista de combos'}
    }
})
def get_combos():
    solo_disponibles = request.args.get('disponibles', 'true').lower() == 'true'
    
    query = Combo.query.filter_by(activo=True)
    
    if solo_disponibles:
        query = query.filter_by(disponible=True)
    
    combos = query.order_by(Combo.tipo, Combo.nombre).all()
    
    return jsonify({
        'combos': [c.to_dict() for c in combos]
    }), 200


@combos_bp.route('/<int:id>', methods=['GET'])
@swag_from({
    'tags': ['Combos'],
    'summary': 'Obtener combo por ID',
    'description': 'Endpoint público para ver detalle de un combo',
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Combo con productos'}}
})
def get_combo(id):
    combo = Combo.query.get_or_404(id)
    return jsonify(combo.to_dict()), 200


@combos_bp.route('/', methods=['POST'])
@jwt_required()
@logistica_required
@swag_from({
    'tags': ['Combos'],
    'summary': 'Crear combo',
    'description': 'Crear combo con productos (HU-04) - Solo Logística',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body', 'in': 'body', 'required': True,
        'schema': {
            'type': 'object',
            'required': ['nombre', 'tipo', 'precio_total', 'productos'],
            'properties': {
                'nombre': {'type': 'string', 'example': 'Combo Básico'},
                'descripcion': {'type': 'string'},
                'tipo': {'type': 'string', 'enum': ['tipo_1', 'tipo_2', 'tipo_3']},
                'precio_total': {'type': 'number', 'example': 15.00},
                'productos': {'type': 'array', 'items': {'type': 'object', 'properties': {
                    'producto_id': {'type': 'integer'},
                    'cantidad': {'type': 'integer', 'default': 1}
                }}}
            }
        }
    }],
    'responses': {201: {'description': 'Combo creado'}}
})
def create_combo():
    data = request.get_json()
    
    required_fields = ['nombre', 'tipo', 'precio_total', 'productos']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} es requerido'}), 400
    
    if data['tipo'] not in ['tipo_1', 'tipo_2', 'tipo_3']:
        return jsonify({'error': 'Tipo debe ser tipo_1, tipo_2 o tipo_3'}), 400
    
    if not data['productos'] or len(data['productos']) == 0:
        return jsonify({'error': 'El combo debe tener al menos un producto'}), 400
    
    combo = Combo(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        precio_total=data['precio_total'],
        tipo=data['tipo'],
        imagen_url=data.get('imagen_url')
    )
    
    db.session.add(combo)
    db.session.flush()
    
    for prod_data in data['productos']:
        producto = Producto.query.get(prod_data['producto_id'])
        if not producto:
            db.session.rollback()
            return jsonify({'error': f'Producto {prod_data["producto_id"]} no encontrado'}), 404
        
        combo_producto = ComboProducto(
            combo_id=combo.id,
            producto_id=prod_data['producto_id'],
            cantidad=prod_data.get('cantidad', 1)
        )
        db.session.add(combo_producto)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Combo creado exitosamente',
        'combo': combo.to_dict()
    }), 201


@combos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@logistica_required
@swag_from({
    'tags': ['Combos'],
    'summary': 'Actualizar combo',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object'}}
    ],
    'responses': {200: {'description': 'Combo actualizado'}}
})
def update_combo(id):
    combo = Combo.query.get_or_404(id)
    data = request.get_json()
    
    combo.nombre = data.get('nombre', combo.nombre)
    combo.descripcion = data.get('descripcion', combo.descripcion)
    combo.precio_total = data.get('precio_total', combo.precio_total)
    combo.imagen_url = data.get('imagen_url', combo.imagen_url)
    combo.disponible = data.get('disponible', combo.disponible)
    combo.activo = data.get('activo', combo.activo)
    
    if 'tipo' in data:
        if data['tipo'] not in ['tipo_1', 'tipo_2', 'tipo_3']:
            return jsonify({'error': 'Tipo debe ser tipo_1, tipo_2 o tipo_3'}), 400
        combo.tipo = data['tipo']
    
    if 'productos' in data:
        ComboProducto.query.filter_by(combo_id=combo.id).delete()
        
        for prod_data in data['productos']:
            producto = Producto.query.get(prod_data['producto_id'])
            if not producto:
                db.session.rollback()
                return jsonify({'error': f'Producto {prod_data["producto_id"]} no encontrado'}), 404
            
            combo_producto = ComboProducto(
                combo_id=combo.id,
                producto_id=prod_data['producto_id'],
                cantidad=prod_data.get('cantidad', 1)
            )
            db.session.add(combo_producto)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Combo actualizado exitosamente',
        'combo': combo.to_dict()
    }), 200


@combos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@logistica_required
@swag_from({
    'tags': ['Combos'],
    'summary': 'Desactivar combo',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Combo desactivado'}}
})
def delete_combo(id):
    combo = Combo.query.get_or_404(id)
    combo.activo = False
    db.session.commit()
    
    return jsonify({'message': 'Combo desactivado exitosamente'}), 200


@combos_bp.route('/<int:id>/toggle-disponibilidad', methods=['POST'])
@jwt_required()
@logistica_required
@swag_from({
    'tags': ['Combos'],
    'summary': 'Cambiar disponibilidad',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Disponibilidad cambiada'}}
})
def toggle_disponibilidad(id):
    combo = Combo.query.get_or_404(id)
    combo.disponible = not combo.disponible
    db.session.commit()
    
    estado = 'disponible' if combo.disponible else 'no disponible'
    return jsonify({
        'message': f'Combo marcado como {estado}',
        'combo': combo.to_dict()
    }), 200
