# Sistema Web de Gestión - CECOALIMENTOS

Sistema web de gestión para la Cooperativa CECOALIMENTOS desarrollado con Flask (Backend) y PostgreSQL (Base de datos).

## 🏗️ Arquitectura

- **Backend**: Python Flask con API RESTful
- **Base de Datos**: PostgreSQL 15
- **Autenticación**: JWT (JSON Web Tokens)
- **Contenedores**: Docker & Docker Compose

## 📋 Requisitos

- Docker Desktop
- Docker Compose
- Git

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone https://github.com/GabrielRieraDEV/Sistema-Web-De-Gestion.git
cd Sistema-Web-De-Gestion
```

### 2. Configurar variables de entorno
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus configuraciones
```

### 3. Levantar los contenedores
```bash
docker-compose up --build
```

### 4. Inicializar la base de datos (primera vez)
```bash
# En otra terminal
docker-compose exec backend flask db init
docker-compose exec backend flask db migrate -m "Initial migration"
docker-compose exec backend flask db upgrade
docker-compose exec backend python seed.py
```

### 5. Acceder a la API
- **API Backend**: http://localhost:5000
- **📖 Documentación Swagger**: http://localhost:5000/docs
- **Health Check**: http://localhost:5000/api/health

> La documentación Swagger permite probar todos los endpoints directamente desde el navegador

## 📚 Endpoints de la API

### Autenticación (`/api/auth`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/register` | Registrar nuevo usuario |
| POST | `/login` | Iniciar sesión |
| POST | `/refresh` | Refrescar token |
| GET | `/me` | Obtener usuario actual |
| POST | `/change-password` | Cambiar contraseña |

### Usuarios (`/api/usuarios`) - Solo Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar usuarios |
| GET | `/<id>` | Obtener usuario |
| POST | `/` | Crear usuario |
| PUT | `/<id>` | Actualizar usuario |
| DELETE | `/<id>` | Desactivar usuario |

### Proveedores (`/api/proveedores`) - Solo Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar proveedores |
| GET | `/<id>` | Obtener proveedor |
| POST | `/` | Crear proveedor |
| PUT | `/<id>` | Actualizar proveedor |
| DELETE | `/<id>` | Desactivar proveedor |

### Productos (`/api/productos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar productos |
| GET | `/<id>` | Obtener producto |
| POST | `/` | Crear producto (Admin) |
| PUT | `/<id>` | Actualizar producto (Admin) |
| GET | `/categorias` | Listar categorías |

### Combos (`/api/combos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar combos (público) |
| GET | `/<id>` | Obtener combo (público) |
| POST | `/` | Crear combo (Logística) |
| PUT | `/<id>` | Actualizar combo (Logística) |
| POST | `/<id>/toggle-disponibilidad` | Cambiar disponibilidad |

### Pedidos a Proveedores (`/api/pedidos`) - Solo Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar pedidos |
| GET | `/<id>` | Obtener pedido |
| POST | `/` | Crear pedido |
| PUT | `/<id>/estado` | Actualizar estado |

### Pagos y Compras (`/api/pagos`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/comprar` | Iniciar compra de combo |
| POST | `/registrar` | Registrar pago |
| GET | `/pendientes` | Pagos pendientes (Cobranza) |
| POST | `/<id>/verificar` | Verificar pago (Cobranza) |
| GET | `/mis-compras` | Mis compras |

### Comentarios (`/api/comentarios`)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Listar comentarios aprobados |
| POST | `/` | Crear comentario |
| GET | `/admin` | Todos los comentarios (Publicidad) |
| POST | `/<id>/moderar` | Moderar comentario |

### Reportes (`/api/reportes`) - Solo Admin
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/semanal` | Reporte semanal |
| GET | `/inventario` | Reporte de inventario |
| GET | `/ventas` | Reporte de ventas |
| GET | `/retiros` | Reporte de retiros |

## 👥 Roles del Sistema

| Rol | Descripción |
|-----|-------------|
| `admin` | Acceso completo al sistema |
| `logistica` | Gestión de combos e inventario |
| `cobranza` | Verificación de pagos |
| `publicidad` | Gestión de comentarios |
| `cliente` | Compra de combos |

## 🔐 Tipos de Usuario

- `regular`: Usuario estándar
- `adulto_mayor`: Prioridad en cola de retiro
- `discapacitado`: Prioridad en cola de retiro

## 🗄️ Estructura del Proyecto

```
Sistema-Web-De-Gestion/
├── backend/
│   ├── app/
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routes/         # Endpoints API
│   │   ├── services/       # Servicios (email, etc.)
│   │   └── utils/          # Utilidades y decoradores
│   ├── migrations/         # Migraciones Alembic
│   ├── config.py           # Configuración
│   ├── run.py              # Punto de entrada
│   ├── seed.py             # Datos iniciales
│   ├── Dockerfile
│   └── requirements.txt
├── database/
│   └── init.sql            # Script inicial DB
├── docker-compose.yml
└── README.md
```

## 🧪 Credenciales de Prueba

Después de ejecutar `seed.py`:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| admin | admin123 | admin |
| logistica | logistica123 | logistica |
| cobranza | cobranza123 | cobranza |
| publicidad | publicidad123 | publicidad |
| cliente1 | cliente123 | cliente |

## 📧 Configuración de Email

Para habilitar notificaciones por correo, configurar en `.env`:
```
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
```

## 🛠️ Comandos Útiles

```bash
# Ver logs
docker-compose logs -f backend

# Acceder al contenedor
docker-compose exec backend bash

# Ejecutar migraciones
docker-compose exec backend flask db upgrade

# Crear nueva migración
docker-compose exec backend flask db migrate -m "descripción"

# Reiniciar servicios
docker-compose restart

# Detener servicios
docker-compose down

# Eliminar volúmenes (reset DB)
docker-compose down -v
```

## 👨‍💻 Desarrolladores

- Palacios José - C.I: 30.681.436
- Soriano Armando - C.I: 30.898.893
- Riera Gabriel - C.I: 31.153.478

## 📄 Licencia

MIT License
