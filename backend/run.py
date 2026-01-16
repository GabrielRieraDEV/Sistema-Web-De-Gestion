import os
from app import create_app, db
from app.models import *

config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)


@app.shell_context_processor
def make_shell_context():
    return {
        'db': db,
        'Usuario': Usuario,
        'Proveedor': Proveedor,
        'Producto': Producto,
        'Combo': Combo,
        'ComboProducto': ComboProducto,
        'PedidoProveedor': PedidoProveedor,
        'DetallePedidoProveedor': DetallePedidoProveedor,
        'Compra': Compra,
        'Pago': Pago,
        'Retiro': Retiro,
        'Comentario': Comentario,
        'Inventario': Inventario
    }


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
