from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from flasgger import swag_from
from app import db
from app.models.comentario import Comentario
from app.utils.decorators import publicidad_required

comentarios_bp = Blueprint('comentarios', __name__)


@comentarios_bp.route('/', methods=['GET'])
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Listar comentarios aprobados',
    'description': 'Endpoint público para ver comentarios aprobados',
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'categoria', 'in': 'query', 'type': 'string', 'enum': ['servicio', 'productos', 'atencion', 'general']}
    ],
    'responses': {200: {'description': 'Lista de comentarios aprobados'}}
})
def get_comentarios_publicos():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    categoria = request.args.get('categoria')
    
    query = Comentario.query.filter_by(estado='aprobado')
    
    if categoria:
        query = query.filter_by(categoria=categoria)
    
    comentarios = query.order_by(Comentario.fecha_creacion.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'comentarios': [c.to_dict() for c in comentarios.items],
        'total': comentarios.total,
        'pages': comentarios.pages,
        'current_page': page
    }), 200


@comentarios_bp.route('/admin', methods=['GET'])
@jwt_required()
@publicidad_required
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Listar todos los comentarios',
    'description': 'Gestión de comentarios (HU-11) - Solo Publicidad',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'integer', 'default': 1},
        {'name': 'per_page', 'in': 'query', 'type': 'integer', 'default': 10},
        {'name': 'estado', 'in': 'query', 'type': 'string', 'enum': ['pendiente', 'aprobado', 'rechazado']}
    ],
    'responses': {200: {'description': 'Lista de todos los comentarios'}}
})
def get_todos_comentarios():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    estado = request.args.get('estado')
    
    query = Comentario.query
    
    if estado:
        query = query.filter_by(estado=estado)
    
    comentarios = query.order_by(Comentario.fecha_creacion.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'comentarios': [c.to_dict() for c in comentarios.items],
        'total': comentarios.total,
        'pages': comentarios.pages,
        'current_page': page
    }), 200


@comentarios_bp.route('/', methods=['POST'])
@jwt_required()
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Crear comentario',
    'description': 'Enviar comentario sobre el servicio (HU-11)',
    'security': [{'Bearer': []}],
    'parameters': [{'name': 'body', 'in': 'body', 'required': True, 'schema': {
        'type': 'object', 'required': ['contenido'],
        'properties': {
            'contenido': {'type': 'string', 'example': 'Excelente servicio'},
            'calificacion': {'type': 'integer', 'minimum': 1, 'maximum': 5},
            'categoria': {'type': 'string', 'enum': ['servicio', 'productos', 'atencion', 'general']}
        }
    }}],
    'responses': {201: {'description': 'Comentario enviado'}}
})
def crear_comentario():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if 'contenido' not in data:
        return jsonify({'error': 'El contenido es requerido'}), 400
    
    calificacion = data.get('calificacion')
    if calificacion and (calificacion < 1 or calificacion > 5):
        return jsonify({'error': 'La calificación debe estar entre 1 y 5'}), 400
    
    comentario = Comentario(
        usuario_id=current_user_id,
        contenido=data['contenido'],
        calificacion=calificacion,
        categoria=data.get('categoria', 'general'),
        estado='pendiente'
    )
    
    db.session.add(comentario)
    db.session.commit()
    
    return jsonify({
        'message': 'Comentario enviado. Pendiente de aprobación.',
        'comentario': comentario.to_dict()
    }), 201


@comentarios_bp.route('/<int:id>/moderar', methods=['POST'])
@jwt_required()
@publicidad_required
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Moderar comentario',
    'description': 'Aprobar o rechazar comentario - Solo Publicidad',
    'security': [{'Bearer': []}],
    'parameters': [
        {'name': 'id', 'in': 'path', 'type': 'integer', 'required': True},
        {'name': 'body', 'in': 'body', 'schema': {'type': 'object', 'properties': {
            'accion': {'type': 'string', 'enum': ['aprobar', 'rechazar']}
        }}}
    ],
    'responses': {200: {'description': 'Comentario moderado'}}
})
def moderar_comentario(id):
    comentario = Comentario.query.get_or_404(id)
    data = request.get_json()
    
    accion = data.get('accion')
    if accion not in ['aprobar', 'rechazar']:
        return jsonify({'error': 'Acción debe ser aprobar o rechazar'}), 400
    
    comentario.estado = 'aprobado' if accion == 'aprobar' else 'rechazado'
    db.session.commit()
    
    return jsonify({
        'message': f'Comentario {comentario.estado}',
        'comentario': comentario.to_dict()
    }), 200


@comentarios_bp.route('/mis-comentarios', methods=['GET'])
@jwt_required()
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Mis comentarios',
    'security': [{'Bearer': []}],
    'responses': {200: {'description': 'Lista de comentarios del usuario'}}
})
def get_mis_comentarios():
    current_user_id = int(get_jwt_identity())
    
    comentarios = Comentario.query.filter_by(usuario_id=current_user_id).order_by(
        Comentario.fecha_creacion.desc()
    ).all()
    
    return jsonify({
        'comentarios': [c.to_dict() for c in comentarios]
    }), 200


@comentarios_bp.route('/estadisticas', methods=['GET'])
@jwt_required()
@publicidad_required
@swag_from({
    'tags': ['Comentarios'],
    'summary': 'Estadísticas de comentarios',
    'security': [{'Bearer': []}],
    'responses': {200: {'description': 'Estadísticas y promedio de calificación'}}
})
def get_estadisticas():
    total = Comentario.query.count()
    aprobados = Comentario.query.filter_by(estado='aprobado').count()
    pendientes = Comentario.query.filter_by(estado='pendiente').count()
    rechazados = Comentario.query.filter_by(estado='rechazado').count()
    
    promedio_calificacion = db.session.query(
        db.func.avg(Comentario.calificacion)
    ).filter(
        Comentario.calificacion.isnot(None),
        Comentario.estado == 'aprobado'
    ).scalar()
    
    return jsonify({
        'total': total,
        'aprobados': aprobados,
        'pendientes': pendientes,
        'rechazados': rechazados,
        'promedio_calificacion': float(promedio_calificacion) if promedio_calificacion else None
    }), 200
