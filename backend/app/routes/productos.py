from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flasgger import swag_from
from app import db
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.proveedor import Proveedor
from app.utils.decorators import admin_required

productos_bp = Blueprint('productos', __name__)


@productos_bp.route('/', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Productos'],
    'summary': 'Listar productos',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'categoria', 'in': 'query', 'type': 'string'},
        {'name': 'proveedor_id', 'in': 'query', 'type': 'integer'}
    ],
    'responses': {200: {'description': 'Lista de productos'}}
})
def get_productos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    categoria = request.args.get('categoria')
    proveedor_id = request.args.get('proveedor_id', type=int)
    activo = request.args.get('activo')
    
    if activo is None:
        query = Producto.query.filter_by(activo=True)
    elif str(activo).lower() == 'all':
        query = Producto.query
    else:
        activo_bool = str(activo).lower() == 'true'
        query = Producto.query.filter_by(activo=activo_bool)
    
    if categoria:
        query = query.filter_by(categoria=categoria)
    if proveedor_id:
        query = query.filter_by(proveedor_id=proveedor_id)
    
    productos = query.order_by(Producto.nombre).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'productos': [p.to_dict() for p in productos.items],
        'total': productos.total,
        'pages': productos.pages,
        'current_page': page
    }), 200


@productos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Productos'],
    'summary': 'Obtener producto por ID',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Producto encontrado'}}
})
def get_producto(id):
    producto = Producto.query.get_or_404(id)
    return jsonify(producto.to_dict()), 200


@productos_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Productos'],
    'summary': 'Crear producto',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body', 'in': 'body', 'required': True,
        'schema': {
            'type': 'object',
            'required': ['nombre', 'precio_compra', 'precio_venta', 'proveedor_id'],
            'properties': {
                'nombre': {'type': 'string', 'example': 'Arroz 1kg'},
                'descripcion': {'type': 'string'},
                'precio_compra': {'type': 'number', 'example': 2.50},
                'precio_venta': {'type': 'number', 'example': 3.00},
                'proveedor_id': {'type': 'integer'},
                'categoria': {'type': 'string'},
                'cantidad_inicial': {'type': 'integer', 'default': 0}
            }
        }
    }],
    'responses': {201: {'description': 'Producto creado'}}
})
def create_producto():
    data = request.get_json()
    
    required_fields = ['nombre', 'precio_compra', 'precio_venta', 'proveedor_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} es requerido'}), 400
    
    proveedor = Proveedor.query.get(data['proveedor_id'])
    if not proveedor:
        return jsonify({'error': 'Proveedor no encontrado'}), 404
    
    producto = Producto(
        nombre=data['nombre'],
        descripcion=data.get('descripcion'),
        precio_compra=data['precio_compra'],
        precio_venta=data['precio_venta'],
        unidad_medida=data.get('unidad_medida', 'unidad'),
        categoria=data.get('categoria'),
        proveedor_id=data['proveedor_id']
    )
    
    db.session.add(producto)
    db.session.flush()
    
    inventario = Inventario(
        producto_id=producto.id,
        cantidad=data.get('cantidad_inicial', 0),
        cantidad_minima=data.get('cantidad_minima', 10)
    )
    db.session.add(inventario)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Producto registrado exitosamente',
        'producto': producto.to_dict()
    }), 201


@productos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Productos'],
    'summary': 'Actualizar producto',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object'}}
    ],
    'responses': {200: {'description': 'Producto actualizado'}}
})
def update_producto(id):
    producto = Producto.query.get_or_404(id)
    data = request.get_json()
    
    if 'proveedor_id' in data:
        proveedor = Proveedor.query.get(data['proveedor_id'])
        if not proveedor:
            return jsonify({'error': 'Proveedor no encontrado'}), 404
        producto.proveedor_id = data['proveedor_id']
    
    producto.nombre = data.get('nombre', producto.nombre)
    producto.descripcion = data.get('descripcion', producto.descripcion)
    producto.precio_compra = data.get('precio_compra', producto.precio_compra)
    producto.precio_venta = data.get('precio_venta', producto.precio_venta)
    producto.unidad_medida = data.get('unidad_medida', producto.unidad_medida)
    producto.categoria = data.get('categoria', producto.categoria)
    producto.activo = data.get('activo', producto.activo)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Producto actualizado exitosamente',
        'producto': producto.to_dict()
    }), 200


@productos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Productos'],
    'summary': 'Desactivar producto',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Producto desactivado'}}
})
def delete_producto(id):
    producto = Producto.query.get_or_404(id)
    producto.activo = False
    db.session.commit()
    
    return jsonify({'message': 'Producto desactivado exitosamente'}), 200


@productos_bp.route('/<int:id>/eliminar', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Productos'],
    'summary': 'Eliminar producto permanentemente',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Producto eliminado'}, 400: {'description': 'Error'}}
})
def eliminar_producto(id):
    producto = Producto.query.get_or_404(id)
    try:
        inventario = Inventario.query.filter_by(producto_id=producto.id).first()
        if inventario:
            db.session.delete(inventario)
        db.session.delete(producto)
        db.session.commit()
        return jsonify({'message': 'Producto eliminado permanentemente'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'No se puede eliminar. Tiene registros asociados.'}), 400


@productos_bp.route('/categorias', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Productos'],
    'summary': 'Listar categorías',
    'security': [{'Bearer': []}],
    'responses': {200: {'description': 'Lista de categorías'}}
})
def get_categorias():
    categorias = db.session.query(Producto.categoria).distinct().filter(
        Producto.categoria.isnot(None),
        Producto.activo == True
    ).all()
    
    return jsonify({
        'categorias': [c[0] for c in categorias if c[0]]
    }), 200
