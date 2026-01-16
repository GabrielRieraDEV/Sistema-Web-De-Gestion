from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from flasgger import swag_from
from app import db
from app.models.compra import Compra
from app.models.pago import Pago
from app.models.retiro import Retiro, generar_numero_retiro
from app.models.combo import Combo, ComboProducto
from app.models.inventario import Inventario
from app.models.usuario import Usuario
from app.utils.decorators import cobranza_required
from app.services.email_service import enviar_notificacion_pago

pagos_bp = Blueprint('pagos', __name__)


@pagos_bp.route('/comprar', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Pagos'],
    'summary': 'Iniciar compra de combo',
    'description': 'Seleccionar combo para comprar (HU-07). Solo un combo a la vez.',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object', 'required': ['combo_id'],
        'properties': {'combo_id': {'type': 'integer', 'example': 1}}
    }}],
    'responses': {201: {'description': 'Compra iniciada con instrucciones de pago'}}
})
def realizar_compra():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'combo_id' not in data:
        return jsonify({'error': 'combo_id es requerido'}), 400
    
    compra_pendiente = Compra.query.filter(
        Compra.usuario_id == current_user_id,
        Compra.estado.in_(['pendiente_pago', 'pago_verificando'])
    ).first()
    
    if compra_pendiente:
        return jsonify({'error': 'Ya tiene una compra pendiente. Complete el pago primero.'}), 400
    
    combo = Combo.query.get(data['combo_id'])
    if not combo:
        return jsonify({'error': 'Combo no encontrado'}), 404
    
    if not combo.disponible or not combo.activo:
        return jsonify({'error': 'Combo no disponible'}), 400
    
    compra = Compra(
        usuario_id=current_user_id,
        combo_id=combo.id,
        monto_total=combo.precio_total,
        estado='pendiente_pago'
    )
    
    db.session.add(compra)
    db.session.commit()
    
    return jsonify({
        'message': 'Compra iniciada. Proceda con el pago.',
        'compra': compra.to_dict(),
        'instrucciones_pago': {
            'banco': 'Banco de Venezuela',
            'metodos': ['pago_movil', 'transferencia'],
            'monto': float(combo.precio_total)
        }
    }), 201


@pagos_bp.route('/registrar', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Pagos'],
    'summary': 'Registrar pago',
    'description': 'Registrar pago móvil o transferencia (HU-08)',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object',
        'required': ['compra_id', 'metodo_pago', 'numero_referencia', 'monto'],
        'properties': {
            'compra_id': {'type': 'integer'},
            'metodo_pago': {'type': 'string', 'enum': ['pago_movil', 'transferencia']},
            'numero_referencia': {'type': 'string', 'example': '123456789'},
            'banco_origen': {'type': 'string'},
            'telefono_pago': {'type': 'string'},
            'monto': {'type': 'number', 'example': 15.00}
        }
    }}],
    'responses': {201: {'description': 'Pago registrado, pendiente verificación'}}
})
def registrar_pago():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    required_fields = ['compra_id', 'metodo_pago', 'numero_referencia', 'monto']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} es requerido'}), 400
    
    compra = Compra.query.get(data['compra_id'])
    if not compra:
        return jsonify({'error': 'Compra no encontrada'}), 404
    
    if compra.usuario_id != current_user_id:
        return jsonify({'error': 'No autorizado'}), 403
    
    if compra.estado != 'pendiente_pago':
        return jsonify({'error': 'Esta compra ya tiene un pago registrado'}), 400
    
    if data['metodo_pago'] not in ['pago_movil', 'transferencia']:
        return jsonify({'error': 'Método de pago inválido'}), 400
    
    pago = Pago(
        compra_id=compra.id,
        metodo_pago=data['metodo_pago'],
        numero_referencia=data['numero_referencia'],
        banco_origen=data.get('banco_origen'),
        telefono_pago=data.get('telefono_pago'),
        monto=data['monto'],
        estado='pendiente'
    )
    
    compra.estado = 'pago_verificando'
    
    db.session.add(pago)
    db.session.commit()
    
    return jsonify({
        'message': 'Pago registrado. Pendiente de verificación.',
        'pago': pago.to_dict()
    }), 201


@pagos_bp.route('/pendientes', methods=['GET'])
@jwt_required()
@cobranza_required
@swag_from({
    'tags': ['Pagos'],
    'summary': 'Listar pagos pendientes',
    'description': 'Pagos pendientes de verificación (HU-09) - Solo Cobranza',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10}
    ],
    'responses': {200: {'description': 'Lista de pagos pendientes'}}
})
def get_pagos_pendientes():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagos = Pago.query.filter_by(estado='pendiente').order_by(
        Pago.fecha_pago.asc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'pagos': [p.to_dict() for p in pagos.items],
        'total': pagos.total,
        'pages': pagos.pages,
        'current_page': page
    }), 200


@pagos_bp.route('/<int:id>/verificar', methods=['POST'])
@jwt_required()
@cobranza_required
@swag_from({
    'tags': ['Pagos'],
    'summary': 'Verificar pago',
    'description': 'Aprobar/rechazar pago y generar retiro (HU-09)',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object', 'properties': {
            'accion': {'type': 'string', 'enum': ['aprobar', 'rechazar']},
            'notas': {'type': 'string'}
        }}}
    ],
    'responses': {200: {'description': 'Pago procesado, retiro creado si aprobado'}}
})
def verificar_pago(id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    pago = Pago.query.get_or_404(id)
    
    if pago.estado != 'pendiente':
        return jsonify({'error': 'Este pago ya fue procesado'}), 400
    
    accion = data.get('accion')
    if accion not in ['aprobar', 'rechazar']:
        return jsonify({'error': 'Acción debe ser aprobar o rechazar'}), 400
    
    pago.verificado_por = current_user_id
    pago.fecha_verificacion = datetime.utcnow()
    pago.notas_verificacion = data.get('notas')
    
    if accion == 'aprobar':
        pago.estado = 'verificado'
        pago.compra.estado = 'pagado'
        
        combo = pago.compra.combo
        for combo_producto in combo.productos:
            inventario = Inventario.query.filter_by(producto_id=combo_producto.producto_id).first()
            if inventario:
                inventario.cantidad -= combo_producto.cantidad
                if inventario.cantidad < 0:
                    inventario.cantidad = 0
                inventario.ultima_salida = datetime.utcnow()
        
        usuario = pago.compra.usuario
        fecha_retiro = datetime.utcnow() + timedelta(days=1)
        
        ultimo_retiro = Retiro.query.filter(
            Retiro.fecha_retiro_programada >= fecha_retiro.replace(hour=0, minute=0, second=0),
            Retiro.fecha_retiro_programada < fecha_retiro.replace(hour=23, minute=59, second=59)
        ).order_by(Retiro.numero_cola.desc()).first()
        
        numero_cola = (ultimo_retiro.numero_cola + 1) if ultimo_retiro else 1
        
        tipo_cola = 'regular'
        if usuario.tipo_usuario in ['adulto_mayor', 'discapacitado']:
            tipo_cola = 'prioritario'
        
        retiro = Retiro(
            compra_id=pago.compra.id,
            numero_retiro=generar_numero_retiro(),
            numero_cola=numero_cola,
            fecha_retiro_programada=fecha_retiro,
            tipo_cola=tipo_cola
        )
        
        db.session.add(retiro)
        pago.compra.estado = 'listo_retiro'
        
        try:
            enviar_notificacion_pago(
                usuario.email,
                usuario.nombre,
                retiro.numero_retiro,
                retiro.numero_cola,
                retiro.fecha_retiro_programada,
                retiro.tipo_cola
            )
        except Exception as e:
            print(f"Error enviando email: {e}")
        
        db.session.commit()
        
        return jsonify({
            'message': 'Pago verificado exitosamente',
            'pago': pago.to_dict(),
            'retiro': retiro.to_dict()
        }), 200
    else:
        pago.estado = 'rechazado'
        pago.compra.estado = 'pendiente_pago'
        db.session.commit()
        
        return jsonify({
            'message': 'Pago rechazado',
            'pago': pago.to_dict()
        }), 200


@pagos_bp.route('/mis-compras', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Pagos'],
    'summary': 'Mis compras',
    'description': 'Obtener historial de compras del usuario',
    'security': [{'Bearer': []}],
    'responses': {200: {'description': 'Lista de compras del usuario'}}
})
def get_mis_compras():
    current_user_id = int(get_jwt_identity())
    
    compras = Compra.query.filter_by(usuario_id=current_user_id).order_by(
        Compra.fecha_compra.desc()
    ).all()
    
    return jsonify({
        'compras': [c.to_dict() for c in compras]
    }), 200
