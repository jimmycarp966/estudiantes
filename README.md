# E-Estudiantes 📚

Plataforma web colaborativa para estudiantes universitarios, terciarios y autodidactas. Organiza tus estudios, comparte apuntes y potencia tu aprendizaje con herramientas especializadas.

## 🚀 Características Principales

### 🔐 Sistema de Autenticación
- Registro e inicio de sesión con email/contraseña
- Autenticación con Google
- Gestión segura de usuarios con Firebase Auth

### 📖 Biblioteca Personal
- Subida y organización de apuntes personales
- Categorización por materias, tags y metadatos
- Gestión de archivos con Firebase Storage
- Vista previa y descarga de documentos

### 🤝 Biblioteca Colaborativa
- Compartir apuntes con la comunidad
- Búsqueda avanzada por materia, universidad, carrera
- Sistema de calificaciones y descargas
- Filtros inteligentes y ordenamiento

### 🛠️ Herramientas de Estudio
- **Temporizador Pomodoro**: Técnica de gestión del tiempo con configuración personalizable
- **Planificador de Estudio**: Organización de sesiones y recordatorios
- **Flashcards**: Sistema de memorización activa (próximamente)
- **Metas de Estudio**: Seguimiento de objetivos (próximamente)

### 📊 Dashboard Intuitivo
- Estadísticas de progreso personal
- Actividad reciente y próximos eventos
- Accesos rápidos a herramientas favoritas
- Métricas de rendimiento

### 📱 Diseño Responsive
- Interfaz optimizada para móviles y tablets
- Diseño moderno con Tailwind CSS
- Experiencia de usuario fluida en todos los dispositivos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript
- **Estilos**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Hosting**: Vercel
- **Control de Versiones**: Git/GitHub

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase
- Cuenta de Vercel (para deployment)

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/eestudiantes.git
cd eestudiantes
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase

1. Crear un nuevo proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilitar Authentication (Email/Password y Google)
3. Crear base de datos Firestore
4. Configurar Storage
5. Obtener las credenciales del proyecto

### 4. Variables de entorno
Crear archivo `.env.local` basado en `env.example`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 5. Ejecutar en desarrollo
```bash
npm run dev
```

## 🚀 Deployment en Vercel

### Configuración automática
1. Conectar repositorio GitHub con Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. El deployment se ejecuta automáticamente con cada push a main

### Variables de entorno en Vercel
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN  
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

## 📁 Estructura del Proyecto

```
eestudiantes/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── auth/              # Páginas de autenticación
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── my-library/        # Biblioteca personal
│   │   ├── shared-library/    # Biblioteca colaborativa
│   │   ├── upload/            # Subida de archivos
│   │   └── study-tools/       # Herramientas de estudio
│   ├── components/            # Componentes reutilizables
│   │   ├── auth/              # Componentes de autenticación
│   │   ├── layout/            # Layouts y navegación
│   │   ├── notes/             # Gestión de apuntes
│   │   ├── study-tools/       # Herramientas de estudio
│   │   └── ui/                # Componentes base de UI
│   ├── contexts/              # Context providers (Auth)
│   ├── lib/                   # Configuración y utilidades
│   └── types/                 # Definiciones de TypeScript
├── public/                    # Archivos estáticos
├── env.example               # Ejemplo de variables de entorno
├── vercel.json              # Configuración de Vercel
└── README.md
```

## 🎯 Funcionalidades Futuras

- [ ] **Flashcards inteligentes** con repetición espaciada
- [ ] **Foros de discusión** por materia
- [ ] **Clases en vivo** y videoconferencias
- [ ] **Inteligencia artificial** para generar resúmenes
- [ ] **Aplicación móvil** nativa
- [ ] **Integración con calendarios** externos
- [ ] **Sistema de gamificación** con logros
- [ ] **Marketplace de tutorías**

## 🤝 Contribución

Las contribuciones son bienvenidas. Para contribuir:

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: Tu Nombre
- **Diseño UX/UI**: Colaboradores bienvenidos
- **Testing**: Comunidad de estudiantes

## 📞 Soporte

¿Necesitas ayuda? 
- 📧 Email: soporte@eestudiantes.com
- 💬 Discord: [Servidor de la comunidad](link-discord)
- 📱 Twitter: [@eestudiantes](link-twitter)

## 🙏 Agradecimientos

- Comunidad de estudiantes por el feedback continuo
- Firebase por la infraestructura robusta
- Vercel por el hosting optimizado
- Next.js team por el framework excepcional

---

**E-Estudiantes** - Potenciando el futuro de la educación colaborativa 🚀