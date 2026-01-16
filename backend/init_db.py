"""
Script para inicializar la base de datos y crear las tablas
Ejecutar: python init_db.py
"""
from app import create_app, db
from app.models import *


def init_database():
    app = create_app('development')
    
    with app.app_context():
        print("Creando tablas en la base de datos...")
        db.create_all()
        print("✅ Tablas creadas exitosamente!")
        print("\nTablas creadas:")
        for table in db.metadata.tables.keys():
            print(f"  - {table}")


if __name__ == '__main__':
    init_database()
