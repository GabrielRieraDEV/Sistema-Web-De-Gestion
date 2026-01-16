from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_mail import Mail
from flasgger import Swagger
from config import config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
mail = Mail()

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "CECOALIMENTOS API",
        "description": "API REST para el Sistema de Gestión de la Cooperativa CECOALIMENTOS",
        "version": "1.0.0",
        "contact": {
            "name": "Equipo de Desarrollo",
            "email": "dev@cecoalimentos.com"
        }
    },
    "securityDefinitions": {
        "Bearer": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Token. Ejemplo: 'Bearer {token}'"
        }
    },
    "security": [{"Bearer": []}],
    "tags": [
        {"name": "Auth", "description": "Autenticación y registro"},
        {"name": "Usuarios", "description": "Gestión de usuarios (Admin)"},
        {"name": "Proveedores", "description": "Gestión de proveedores (Admin)"},
        {"name": "Productos", "description": "Gestión de productos"},
        {"name": "Combos", "description": "Gestión de combos"},
        {"name": "Pedidos", "description": "Pedidos a proveedores (Admin)"},
        {"name": "Pagos", "description": "Compras y pagos"},
        {"name": "Comentarios", "description": "Sistema de comentarios"},
        {"name": "Reportes", "description": "Reportes administrativos (Admin)"}
    ]
}

swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/docs"
}


def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    mail.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    Swagger(app, template=swagger_template, config=swagger_config)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.usuarios import usuarios_bp
    from app.routes.proveedores import proveedores_bp
    from app.routes.productos import productos_bp
    from app.routes.combos import combos_bp
    from app.routes.pedidos import pedidos_bp
    from app.routes.pagos import pagos_bp
    from app.routes.comentarios import comentarios_bp
    from app.routes.reportes import reportes_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    app.register_blueprint(proveedores_bp, url_prefix='/api/proveedores')
    app.register_blueprint(productos_bp, url_prefix='/api/productos')
    app.register_blueprint(combos_bp, url_prefix='/api/combos')
    app.register_blueprint(pedidos_bp, url_prefix='/api/pedidos')
    app.register_blueprint(pagos_bp, url_prefix='/api/pagos')
    app.register_blueprint(comentarios_bp, url_prefix='/api/comentarios')
    app.register_blueprint(reportes_bp, url_prefix='/api/reportes')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'CECOALIMENTOS API running'}
    
    return app
