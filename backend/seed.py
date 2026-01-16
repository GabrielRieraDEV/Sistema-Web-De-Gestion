"""
Script para poblar la base de datos con datos iniciales
Ejecutar: python seed.py
"""
from app import create_app, db
from app.models.usuario import Usuario
from app.models.proveedor import Proveedor
from app.models.producto import Producto
from app.models.inventario import Inventario
from app.models.combo import Combo, ComboProducto


def seed_database():
    app = create_app('development')
    
    with app.app_context():
        print("Iniciando seed de la base de datos...")
        
        # Crear usuario administrador
        admin = Usuario.query.filter_by(username='admin').first()
        if not admin:
            admin = Usuario(
                nombre='Administrador',
                apellido='Sistema',
                cedula='V-00000000',
                email='admin@cecoalimentos.com',
                telefono='0412-0000000',
                tipo_usuario='regular',
                rol='admin',
                username='admin'
            )
            admin.set_password('admin123')
            db.session.add(admin)
            print("✓ Usuario admin creado")
        
        # Crear usuarios de ejemplo por departamento
        usuarios_ejemplo = [
            {
                'nombre': 'María', 'apellido': 'González', 'cedula': 'V-12345678',
                'email': 'logistica@cecoalimentos.com', 'rol': 'logistica',
                'username': 'logistica', 'password': 'logistica123'
            },
            {
                'nombre': 'Juan', 'apellido': 'Pérez', 'cedula': 'V-23456789',
                'email': 'cobranza@cecoalimentos.com', 'rol': 'cobranza',
                'username': 'cobranza', 'password': 'cobranza123'
            },
            {
                'nombre': 'Ana', 'apellido': 'Martínez', 'cedula': 'V-34567890',
                'email': 'publicidad@cecoalimentos.com', 'rol': 'publicidad',
                'username': 'publicidad', 'password': 'publicidad123'
            },
            {
                'nombre': 'Carlos', 'apellido': 'López', 'cedula': 'V-45678901',
                'email': 'cliente@ejemplo.com', 'rol': 'cliente',
                'tipo_usuario': 'regular', 'username': 'cliente1', 'password': 'cliente123'
            },
            {
                'nombre': 'Rosa', 'apellido': 'Ramírez', 'cedula': 'V-56789012',
                'email': 'adultomayor@ejemplo.com', 'rol': 'cliente',
                'tipo_usuario': 'adulto_mayor', 'username': 'cliente2', 'password': 'cliente123'
            }
        ]
        
        for u_data in usuarios_ejemplo:
            if not Usuario.query.filter_by(username=u_data['username']).first():
                usuario = Usuario(
                    nombre=u_data['nombre'],
                    apellido=u_data['apellido'],
                    cedula=u_data['cedula'],
                    email=u_data['email'],
                    rol=u_data['rol'],
                    tipo_usuario=u_data.get('tipo_usuario', 'regular'),
                    username=u_data['username']
                )
                usuario.set_password(u_data['password'])
                db.session.add(usuario)
        print("✓ Usuarios de ejemplo creados")
        
        # Crear proveedores
        proveedores_data = [
            {
                'nombre': 'Distribuidora Central', 'rif': 'J-12345678-9',
                'direccion': 'Av. Principal, Ciudad Bolívar',
                'telefono': '0285-1234567', 'email': 'ventas@distcentral.com',
                'persona_contacto': 'Pedro García', 'tiempo_entrega_dias': 2
            },
            {
                'nombre': 'Alimentos del Sur', 'rif': 'J-98765432-1',
                'direccion': 'Zona Industrial, Puerto Ordaz',
                'telefono': '0286-7654321', 'email': 'pedidos@alimentossur.com',
                'persona_contacto': 'Laura Mendez', 'tiempo_entrega_dias': 3
            }
        ]
        
        proveedores = []
        for p_data in proveedores_data:
            prov = Proveedor.query.filter_by(rif=p_data['rif']).first()
            if not prov:
                prov = Proveedor(**p_data)
                db.session.add(prov)
                db.session.flush()
            proveedores.append(prov)
        print("✓ Proveedores creados")
        
        # Crear productos
        productos_data = [
            {'nombre': 'Arroz 1kg', 'precio_compra': 2.50, 'precio_venta': 3.00, 'categoria': 'Granos', 'proveedor_idx': 0},
            {'nombre': 'Harina PAN 1kg', 'precio_compra': 1.80, 'precio_venta': 2.20, 'categoria': 'Harinas', 'proveedor_idx': 0},
            {'nombre': 'Aceite 1L', 'precio_compra': 3.00, 'precio_venta': 3.50, 'categoria': 'Aceites', 'proveedor_idx': 0},
            {'nombre': 'Azúcar 1kg', 'precio_compra': 1.50, 'precio_venta': 2.00, 'categoria': 'Endulzantes', 'proveedor_idx': 1},
            {'nombre': 'Pasta 500g', 'precio_compra': 1.20, 'precio_venta': 1.50, 'categoria': 'Pastas', 'proveedor_idx': 1},
            {'nombre': 'Leche en polvo 400g', 'precio_compra': 4.00, 'precio_venta': 5.00, 'categoria': 'Lácteos', 'proveedor_idx': 1},
            {'nombre': 'Caraotas negras 500g', 'precio_compra': 1.80, 'precio_venta': 2.30, 'categoria': 'Granos', 'proveedor_idx': 0},
            {'nombre': 'Sal 1kg', 'precio_compra': 0.50, 'precio_venta': 0.80, 'categoria': 'Condimentos', 'proveedor_idx': 0},
            {'nombre': 'Café 250g', 'precio_compra': 3.50, 'precio_venta': 4.50, 'categoria': 'Bebidas', 'proveedor_idx': 1},
            {'nombre': 'Atún en lata', 'precio_compra': 2.00, 'precio_venta': 2.80, 'categoria': 'Enlatados', 'proveedor_idx': 1},
        ]
        
        productos = []
        for p_data in productos_data:
            prod = Producto.query.filter_by(nombre=p_data['nombre']).first()
            if not prod:
                prod = Producto(
                    nombre=p_data['nombre'],
                    precio_compra=p_data['precio_compra'],
                    precio_venta=p_data['precio_venta'],
                    categoria=p_data['categoria'],
                    proveedor_id=proveedores[p_data['proveedor_idx']].id,
                    unidad_medida='unidad'
                )
                db.session.add(prod)
                db.session.flush()
                
                # Crear inventario
                inv = Inventario(
                    producto_id=prod.id,
                    cantidad=100,
                    cantidad_minima=20
                )
                db.session.add(inv)
            productos.append(prod)
        print("✓ Productos e inventario creados")
        
        # Crear combos (3 tipos según HU-04)
        combos_data = [
            {
                'nombre': 'Combo Básico',
                'descripcion': 'Combo con productos esenciales para el hogar',
                'tipo': 'tipo_1',
                'precio_total': 15.00,
                'productos': [0, 1, 3, 4, 7]  # Arroz, Harina, Azúcar, Pasta, Sal
            },
            {
                'nombre': 'Combo Familiar',
                'descripcion': 'Combo completo para toda la familia',
                'tipo': 'tipo_2',
                'precio_total': 25.00,
                'productos': [0, 1, 2, 3, 4, 5, 6, 7]  # Más productos
            },
            {
                'nombre': 'Combo Premium',
                'descripcion': 'Combo premium con productos selectos',
                'tipo': 'tipo_3',
                'precio_total': 35.00,
                'productos': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]  # Todos los productos
            }
        ]
        
        for c_data in combos_data:
            combo = Combo.query.filter_by(nombre=c_data['nombre']).first()
            if not combo:
                combo = Combo(
                    nombre=c_data['nombre'],
                    descripcion=c_data['descripcion'],
                    tipo=c_data['tipo'],
                    precio_total=c_data['precio_total'],
                    disponible=True,
                    activo=True
                )
                db.session.add(combo)
                db.session.flush()
                
                for prod_idx in c_data['productos']:
                    if prod_idx < len(productos):
                        cp = ComboProducto(
                            combo_id=combo.id,
                            producto_id=productos[prod_idx].id,
                            cantidad=1
                        )
                        db.session.add(cp)
        print("✓ Combos creados")
        
        db.session.commit()
        print("\n✅ Seed completado exitosamente!")
        print("\nCredenciales de acceso:")
        print("  Admin:      admin / admin123")
        print("  Logística:  logistica / logistica123")
        print("  Cobranza:   cobranza / cobranza123")
        print("  Publicidad: publicidad / publicidad123")
        print("  Cliente:    cliente1 / cliente123")


if __name__ == '__main__':
    seed_database()
