from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime, timedelta
from sqlalchemy import func
from flasgger import swag_from
from app import db
from app.models.compra import Compra
from app.models.pago import Pago
from app.models.inventario import Inventario
from app.models.producto import Producto
from app.models.combo import Combo
from app.utils.decorators import admin_required

reportes_bp = Blueprint('reportes', __name__)


@reportes_bp.route('/semanal', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Reportes'],
    'summary': 'Reporte semanal',
    'description': 'Reporte de recaudación e inventario (HU-12)',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'fecha_inicio', 'in': 'query', 'type': 'string', 'format': 'date'},
        {'name': 'fecha_fin', 'in': 'query', 'type': 'string', 'format': 'date'}
    ],
    'responses': {200: {'description': 'Reporte con recaudación, ventas por combo e inventario'}}
})
def reporte_semanal():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    
    if fecha_inicio:
        fecha_inicio = datetime.fromisoformat(fecha_inicio)
    else:
        fecha_inicio = datetime.utcnow() - timedelta(days=7)
    
    if fecha_fin:
        fecha_fin = datetime.fromisoformat(fecha_fin)
    else:
        fecha_fin = datetime.utcnow()
    
    pagos_verificados = Pago.query.filter(
        Pago.estado == 'verificado',
        Pago.fecha_verificacion >= fecha_inicio,
        Pago.fecha_verificacion <= fecha_fin
    ).all()
    
    total_recaudado = sum(float(p.monto) for p in pagos_verificados)
    cantidad_ventas = len(pagos_verificados)
    
    ventas_por_combo = db.session.query(
        Combo.nombre,
        func.count(Compra.id).label('cantidad'),
        func.sum(Compra.monto_total).label('total')
    ).join(Compra, Combo.id == Compra.combo_id).join(
        Pago, Compra.id == Pago.compra_id
    ).filter(
        Pago.estado == 'verificado',
        Pago.fecha_verificacion >= fecha_inicio,
        Pago.fecha_verificacion <= fecha_fin
    ).group_by(Combo.nombre).all()
    
    inventario = Inventario.query.join(Producto).filter(
        Producto.activo == True
    ).all()
    
    productos_bajo_stock = [
        inv.to_dict() for inv in inventario 
        if inv.cantidad < inv.cantidad_minima
    ]
    
    return jsonify({
        'periodo': {
            'fecha_inicio': fecha_inicio.isoformat(),
            'fecha_fin': fecha_fin.isoformat()
        },
        'recaudacion': {
            'total': total_recaudado,
            'cantidad_ventas': cantidad_ventas,
            'promedio_venta': total_recaudado / cantidad_ventas if cantidad_ventas > 0 else 0
        },
        'ventas_por_combo': [
            {
                'combo': v[0],
                'cantidad': v[1],
                'total': float(v[2]) if v[2] else 0
            } for v in ventas_por_combo
        ],
        'inventario': {
            'total_productos': len(inventario),
            'productos_bajo_stock': len(productos_bajo_stock),
            'detalle_bajo_stock': productos_bajo_stock
        }
    }), 200


@reportes_bp.route('/inventario', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Reportes'],
    'summary': 'Reporte de inventario',
    'description': 'Estado detallado del inventario con alertas de bajo stock',
    'security': [{'Bearer': []}],
    'responses': {200: {'description': 'Resumen y detalle del inventario'}}
})
def reporte_inventario():
    inventario = Inventario.query.join(Producto).filter(
        Producto.activo == True
    ).order_by(Producto.nombre).all()
    
    resumen = {
        'total_productos': len(inventario),
        'bajo_stock': sum(1 for inv in inventario if inv.cantidad < inv.cantidad_minima),
        'sin_stock': sum(1 for inv in inventario if inv.cantidad == 0),
        'valor_total': sum(
            inv.cantidad * float(inv.producto.precio_compra) 
            for inv in inventario
        )
    }
    
    return jsonify({
        'resumen': resumen,
        'productos': [inv.to_dict() for inv in inventario]
    }), 200


@reportes_bp.route('/ventas', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Reportes'],
    'summary': 'Reporte de ventas',
    'description': 'Ventas diarias por período',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'fecha_inicio', 'in': 'query', 'type': 'string', 'format': 'date'},
        {'name': 'fecha_fin', 'in': 'query', 'type': 'string', 'format': 'date'}
    ],
    'responses': {200: {'description': 'Ventas diarias y totales'}}
})
def reporte_ventas():
    fecha_inicio = request.args.get('fecha_inicio')
    fecha_fin = request.args.get('fecha_fin')
    
    if fecha_inicio:
        fecha_inicio = datetime.fromisoformat(fecha_inicio)
    else:
        fecha_inicio = datetime.utcnow() - timedelta(days=30)
    
    if fecha_fin:
        fecha_fin = datetime.fromisoformat(fecha_fin)
    else:
        fecha_fin = datetime.utcnow()
    
    ventas = db.session.query(
        func.date(Pago.fecha_verificacion).label('fecha'),
        func.count(Pago.id).label('cantidad'),
        func.sum(Pago.monto).label('total')
    ).filter(
        Pago.estado == 'verificado',
        Pago.fecha_verificacion >= fecha_inicio,
        Pago.fecha_verificacion <= fecha_fin
    ).group_by(func.date(Pago.fecha_verificacion)).order_by(
        func.date(Pago.fecha_verificacion)
    ).all()
    
    return jsonify({
        'periodo': {
            'fecha_inicio': fecha_inicio.isoformat(),
            'fecha_fin': fecha_fin.isoformat()
        },
        'ventas_diarias': [
            {
                'fecha': v[0].isoformat() if v[0] else None,
                'cantidad': v[1],
                'total': float(v[2]) if v[2] else 0
            } for v in ventas
        ],
        'totales': {
            'cantidad': sum(v[1] for v in ventas),
            'monto': sum(float(v[2]) if v[2] else 0 for v in ventas)
        }
    }), 200


@reportes_bp.route('/retiros', methods=['GET'])
@jwt_required()
@admin_required
@swag_from({
    'tags': ['Reportes'],
    'summary': 'Reporte de retiros',
    'description': 'Retiros programados por fecha con estado',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'fecha', 'in': 'query', 'type': 'string', 'format': 'date'}],
    'responses': {200: {'description': 'Resumen y lista de retiros'}}
})
def reporte_retiros():
    from app.models.retiro import Retiro
    
    fecha = request.args.get('fecha')
    if fecha:
        fecha = datetime.fromisoformat(fecha)
    else:
        fecha = datetime.utcnow()
    
    inicio_dia = fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    fin_dia = fecha.replace(hour=23, minute=59, second=59, microsecond=999999)
    
    retiros = Retiro.query.filter(
        Retiro.fecha_retiro_programada >= inicio_dia,
        Retiro.fecha_retiro_programada <= fin_dia
    ).order_by(Retiro.numero_cola).all()
    
    resumen = {
        'total': len(retiros),
        'programados': sum(1 for r in retiros if r.estado == 'programado'),
        'en_cola': sum(1 for r in retiros if r.estado == 'en_cola'),
        'retirados': sum(1 for r in retiros if r.estado == 'retirado'),
        'no_presentados': sum(1 for r in retiros if r.estado == 'no_presentado'),
        'prioritarios': sum(1 for r in retiros if r.tipo_cola == 'prioritario')
    }
    
    return jsonify({
        'fecha': fecha.isoformat(),
        'resumen': resumen,
        'retiros': [r.to_dict() for r in retiros]
    }), 200
