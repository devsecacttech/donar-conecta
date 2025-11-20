# Donar Conecta - MVP Prototype

## Descripción General

**Donar Conecta** es una aplicación web desarrollada con Ionic Angular que funciona como un puente transparente y confiable entre donantes (personas y empresas) y personas o familias en situación de vulnerabilidad económica. Su objetivo principal es facilitar y garantizar que la ayuda llegue de manera directa, verificada y con seguimiento.

## Características Principales

### 1. Donaciones Diversificadas
- Donaciones monetarias seguras
- Registro de donaciones en especie (alimentos, ropa, etc.)
- Sistema de apadrinamiento recurrente

### 2. Figura del "Gestor Solidario"
- Responsable de recibir y entregar las donaciones
- Toma de fotos como comprobante
- Subida automática de evidencias a la plataforma

### 3. Transparencia y Comprobación Total
- Historias de Impacto con fotos de entregas
- Notificaciones al donante
- Mensajes de agradecimiento de beneficiarios

### 4. Sistema de Seguimiento y Trazabilidad
- Perfiles anónimos para beneficiarios
- Historial de donaciones recibidas
- Seguimiento del progreso

### 5. Roles de Usuario
- **Donante**: Puede realizar donaciones y ver su impacto
- **Gestor Solidario**: Gestiona entregas y casos
- **Administrador**: Supervisa toda la plataforma
- **Beneficiario**: Perfil anónimo protegido

## Tecnologías Utilizadas

- **Framework**: Ionic 7 + Angular 20
- **Lenguaje**: TypeScript
- **Estilos**: SCSS
- **Gestión de Estado**: RxJS + BehaviorSubject
- **Routing**: Angular Router con Guards
- **UI Components**: Ionic Components

## Estructura del Proyecto

```
src/app/
├── guards/           # Auth guards para protección de rutas
├── models/           # Interfaces y tipos TypeScript
│   ├── user.model.ts
│   ├── donation.model.ts
│   ├── case.model.ts
│   └── metrics.model.ts
├── services/         # Servicios con datos mock
│   ├── auth.service.ts
│   ├── donation.service.ts
│   ├── beneficiary.service.ts
│   ├── case.service.ts
│   └── metrics.service.ts
└── pages/           # Páginas de la aplicación
    ├── login/
    ├── donor/       # Dashboard y funcionalidades del donante
    ├── manager/     # Panel del gestor solidario
    └── admin/       # Panel del administrador
```

## Instalación y Ejecución

### Prerrequisitos
- Node.js (v18 o superior)
- npm (v9 o superior)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd donar-conecta
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en modo desarrollo**
```bash
npm start
# o
ionic serve
```

La aplicación se abrirá automáticamente en `http://localhost:8100`

### Build para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `www/`

## Usuarios de Demostración

La aplicación incluye usuarios de prueba con datos mock:

### Donantes
- **María García**
  - Email: `maria@donor.com`
  - Password: `demo123`
  - Total donado: 5,420€
  - 28 donaciones realizadas

- **Pedro López**
  - Email: `pedro@donor.com`
  - Password: `demo123`
  - Total donado: 2,150€
  - 12 donaciones realizadas

### Gestores Solidarios
- **Carlos Rodríguez**
  - Email: `carlos@manager.com`
  - Password: `demo123`
  - Zona: Madrid Centro
  - 156 entregas completadas

- **Laura Sánchez**
  - Email: `laura@manager.com`
  - Password: `demo123`
  - Zona: Barcelona Sur
  - 89 entregas completadas

### Administrador
- **Ana Martínez**
  - Email: `ana@admin.com`
  - Password: `demo123`
  - Permisos completos

## Funcionalidades Implementadas

### ✅ Completadas en este MVP

1. **Sistema de Autenticación**
   - Login con validación de roles
   - Guards para protección de rutas
   - Redirección automática según rol
   - Usuarios demo para cada rol

2. **Dashboard del Donante** ✅
   - Métricas personales (total donado, número de donaciones, historias de impacto)
   - Donaciones recientes con estados
   - Historias de impacto con fotos
   - Beneficiarios apadrinados
   - Navegación intuitiva con tabs
   - Acciones rápidas

3. **Página de Nueva Donación** ✅
   - Selector de tipo de donación (Dinero, En Especie, Apadrinamiento)
   - Formulario completo para donación monetaria con presets de cantidad
   - Formulario para donaciones en especie con lista de artículos
   - Sistema de apadrinamiento con configuración de frecuencia
   - Selector de beneficiario (específico o automático)
   - Resumen de donación
   - Validación de formularios
   - Mensajes de confirmación

4. **Galería de Historias de Impacto** ✅
   - Vista completa de todas las historias
   - Filtro: "Mis Historias" y "Todas"
   - Tarjetas con fotos, fechas, ubicación
   - Mensajes de beneficiarios
   - Contador de vistas
   - Información del gestor
   - Empty states para cuando no hay historias
   - Diseño responsive en grid

5. **Modelos de Datos Completos**
   - Usuario (con roles: Donante, Gestor, Admin, Beneficiario)
   - Donaciones (dinero, en especie, apadrinamiento)
   - Casos de necesidad
   - Historias de impacto
   - Métricas y estadísticas

6. **Servicios Mock**
   - AuthService con usuarios de prueba
   - DonationService con donaciones de ejemplo
   - BeneficiaryService con beneficiarios ficticios
   - CaseService para gestión de casos
   - MetricsService para estadísticas
   - Creación de donaciones en tiempo real

7. **Interfaz de Usuario**
   - Diseño responsive y amigable
   - Componentes Ionic optimizados
   - Navegación inferior para móviles
   - Tarjetas de métricas visuales
   - Scroll horizontal para historias de impacto
   - Loading states y spinners
   - Toasts y alertas
   - Formularios con validación

### 🔄 Pendientes para Futuras Iteraciones

1. **Página de Apadrinamiento**
   - Lista de beneficiarios disponibles para apadrinar
   - Detalles de cada beneficiario
   - Sistema de seguimiento de apadrinados

2. **Panel del Gestor Solidario**
   - Dashboard con métricas del gestor
   - Lista de donaciones asignadas
   - Formulario para reportar entregas
   - Subida de fotos de comprobante
   - Gestión de casos

3. **Panel del Administrador**
   - Dashboard con métricas globales
   - Gestión de usuarios
   - Reportes y estadísticas
   - Configuración de la plataforma

4. **Sistema de Notificaciones**
   - Notificaciones push
   - Alertas de nuevas entregas
   - Recordatorios para apadrinamiento

5. **Integración con Backend**
   - API REST para comunicación con servidor
   - Autenticación JWT
   - Upload de imágenes a cloud storage
   - Base de datos real

## Datos Mock Incluidos

El proyecto incluye datos de ejemplo en los servicios:

- **5 Usuarios** (2 donantes, 2 gestores, 1 admin)
- **5 Donaciones** con diferentes estados
- **3 Historias de Impacto** con fotos y testimonios
- **5 Beneficiarios** con perfiles anónimos y necesidades
- **5 Casos** de diferentes prioridades
- **Métricas calculadas** automáticamente

## Routing y Protección

El sistema de routing está completamente configurado con:

```typescript
/login                    # Página de login (pública)
/donor                    # Área de donantes (protegida)
  ├── /dashboard         # Dashboard principal
  ├── /donate            # Nueva donación
  ├── /impact-stories    # Historias de impacto
  └── /sponsorship       # Apadrinamientos

/manager                  # Área de gestores (protegida)
  ├── /dashboard         # Dashboard del gestor
  ├── /deliveries        # Entregas pendientes
  └── /cases             # Casos asignados

/admin                    # Área de administrador (protegida)
  ├── /dashboard         # Dashboard administrativo
  ├── /users             # Gestión de usuarios
  └── /reports           # Reportes y estadísticas
```

## Seguridad

- **Guards**: Todas las rutas están protegidas con AuthGuard
- **Roles**: Verificación de roles en cada ruta
- **Logout**: Limpieza completa de sesión
- **Datos Anónimos**: Los beneficiarios tienen perfiles anónimos

## Diseño y UX

- **Colores**: Paleta de colores coherente con Ionic
- **Responsive**: Adaptable a móviles, tablets y desktop
- **Iconografía**: Ionic Icons para consistencia visual
- **Navegación**: Intuitiva con footer navigation
- **Feedback**: Loading states y mensajes claros

## Scripts Disponibles

```json
{
  "start": "ionic serve",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint"
}
```

## Próximos Pasos para Desarrollo Completo

1. Implementar las páginas restantes (donate, impact-stories, sponsorship)
2. Completar los dashboards de Gestor y Administrador
3. Agregar formularios para crear donaciones y casos
4. Implementar subida de imágenes (simulada o con servicio)
5. Añadir gráficos y visualizaciones de datos
6. Crear sistema de notificaciones
7. Integrar con backend real (API REST)
8. Implementar pruebas unitarias y e2e
9. Optimizar rendimiento y bundle size
10. Preparar para despliegue en producción

## Contribuciones

Este es un proyecto prototipo MVP. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto es un prototipo de demostración.

## Contacto

Para más información sobre este proyecto, por favor contacta al equipo de desarrollo.

---

**Nota**: Todos los datos de este MVP son ficticios y se generan mediante servicios mock en el frontend. No hay conexión con backend real ni base de datos.
