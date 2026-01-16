from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from flasgger import swag_from
from app import db
from app.models.pedido_proveedor import PedidoProveedor, DetallePedidoProveedor
from app.models.proveedor import Proveedor
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.utils.decorators import admin_required

pedidos_bp = Blueprint('pedidos', __name__)


@pedidos_bp.route('/', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Pedidos'],
    'summary': 'Listar pedidos a proveedores',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'estado', 'in': 'query', 'type': 'string', 'enum': ['pendiente', 'confirmado', 'en_transito', 'recibido', 'cancelado']},
        {'name': 'proveedor_id', 'in': 'query', 'type': 'integer'}
    ],
    'responses': {200: {'description': 'Lista de pedidos'}}
})
def get_pedidos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    estado = request.args.get('estado')
    proveedor_id = request.args.get('proveedor_id', type=int)
    
    query = PedidoProveedor.query
    
    if estado:
        query = query.filter_by(estado=estado)
    if proveedor_id:
        query = query.filter_by(proveedor_id=proveedor_id)
    
    pedidos = query.order_by(PedidoProveedor.fecha_pedido.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'pedidos': [p.to_dict() for p in pedidos.items],
        'total': pedidos.total,
        'pages': pedidos.pages,
        'current_page': page
    }), 200


@pedidos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Pedidos'],
    'summary': 'Obtener pedido por ID',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Pedido con detalles'}}
})
def get_pedido(id):
    pedido = PedidoProveedor.query.get_or_404(id)
    return jsonify(pedido.to_dict()), 200


@pedidos_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Pedidos'],
    'summary': 'Crear pedido a proveedor',
    'description': 'Realizar pedido a proveedor para abastecer inventario (HU-03)',
    'security': [{'Bearer': []}],
    'parameters': [{
        'name': 'body', 'in': 'body', 'required': True,
        'schema': {
            'type': 'object',
            'required': ['proveedor_id', 'detalles'],
            'properties': {
                'proveedor_id': {'type': 'integer'},
                'notas': {'type': 'string'},
                'detalles': {'type': 'array', 'items': {'type': 'object', 'properties': {
                    'producto_id': {'type': 'integer'},
                    'cantidad': {'type': 'integer'}
                }}}
            }
        }
    }],
    'responses': {201: {'description': 'Pedido creado'}}
})
def create_pedido():
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    if 'proveedor_id' not in data:
        return jsonify({'error': 'proveedor_id es requerido'}), 400
    
    if 'detalles' not in data or len(data['detalles']) == 0:
        return jsonify({'error': 'El pedido debe tener al menos un producto'}), 400
    
    proveedor = Proveedor.query.get(data['proveedor_id'])
    if not proveedor:
        return jsonify({'error': 'Proveedor no encontrado'}), 404
    
    fecha_entrega = datetime.utcnow() + timedelta(days=proveedor.tiempo_entrega_dias)
    
    pedido = PedidoProveedor(
        proveedor_id=data['proveedor_id'],
        notas=data.get('notas'),
        fecha_entrega_esperada=fecha_entrega,
        creado_por=current_user_id
    )
    
    db.session.add(pedido)
    db.session.flush()
    
    total = 0
    for detalle_data in data['detalles']:
        producto = Producto.query.get(detalle_data['producto_id'])
        if not producto:
            db.session.rollback()
            return jsonify({'error': f'Producto {detalle_data["producto_id"]} no encontrado'}), 404
        
        if producto.proveedor_id != proveedor.id:
            db.session.rollback()
            return jsonify({'error': f'Producto {producto.nombre} no pertenece al proveedor seleccionado'}), 400
        
        cantidad = detalle_data['cantidad']
        precio = float(producto.precio_compra)
        subtotal = cantidad * precio
        total += subtotal
        
        detalle = DetallePedidoProveedor(
            pedido_id=pedido.id,
            producto_id=producto.id,
            cantidad=cantidad,
            precio_unitario=precio,
            subtotal=subtotal
        )
        db.session.add(detalle)
    
    pedido.total = total
    db.session.commit()
    
    return jsonify({
        'message': 'Pedido creado exitosamente',
        'pedido': pedido.to_dict()
    }), 201


@pedidos_bp.route('/<int:id>/estado', methods=['PUT'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Pedidos'],
    'summary': 'Actualizar estado del pedido',
    'description': 'Cambiar estado y actualizar inventario al recibir',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object', 'properties': {
            'estado': {'type': 'string', 'enum': ['pendiente', 'confirmado', 'en_transito', 'recibido', 'cancelado']}
        }}}
    ],
    'responses': {200: {'description': 'Estado actualizado'}}
})
def update_estado_pedido(id):
    pedido = PedidoProveedor.query.get_or_404(id)
    data = request.get_json()
    
    nuevo_estado = data.get('estado')
    estados_validos = ['pendiente', 'confirmado', 'en_transito', 'recibido', 'cancelado']
    
    if nuevo_estado not in estados_validos:
        return jsonify({'error': f'Estado inválido. Debe ser uno de: {", ".join(estados_validos)}'}), 400
    
    if nuevo_estado == 'recibido':
        pedido.fecha_entrega_real = datetime.utcnow()
        
        for detalle in pedido.detalles:
            inventario = Inventario.query.filter_by(producto_id=detalle.producto_id).first()
            if inventario:
                inventario.cantidad += detalle.cantidad
                inventario.ultima_entrada = datetime.utcnow()
            else:
                inventario = Inventario(
                    producto_id=detalle.producto_id,
                    cantidad=detalle.cantidad,
                    ultima_entrada=datetime.utcnow()
                )
                db.session.add(inventario)
    
    pedido.estado = nuevo_estado
    db.session.commit()
    
    return jsonify({
        'message': f'Estado actualizado a {nuevo_estado}',
        'pedido': pedido.to_dict()
    }), 200


@pedidos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Pedidos'],
    'summary': 'Cancelar pedido',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'id', 'in': 'path', 'type': 'integer', 'required': True}],
    'responses': {200: {'description': 'Pedido cancelado'}}
})
def cancel_pedido(id):
    pedido = PedidoProveedor.query.get_or_404(id)
    
    if pedido.estado in ['recibido', 'cancelado']:
        return jsonify({'error': 'No se puede cancelar un pedido recibido o ya cancelado'}), 400
    
    pedido.estado = 'cancelado'
    db.session.commit()
    
    return jsonify({'message': 'Pedido cancelado exitosamente'}), 200
