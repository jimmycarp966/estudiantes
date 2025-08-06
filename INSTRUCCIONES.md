# 🎓 E-Estudiantes - Instrucciones de Configuración

¡Felicidades! Has creado una plataforma completa para estudiantes universitarios. Aquí tienes las instrucciones paso a paso para configurar y desplegar tu aplicación.

## 📁 Lo que se ha creado

### ✅ Funcionalidades implementadas:

1. **🔐 Sistema de Autenticación**
   - Registro e inicio de sesión con email/contraseña
   - Autenticación con Google
   - Gestión de sesiones con Firebase Auth

2. **📚 Biblioteca Personal**
   - Subida de archivos (PDF, DOC, DOCX, TXT, PPT, PPTX)
   - Organización por etiquetas y metadatos
   - Vista de grid y lista
   - Búsqueda y filtros avanzados

3. **🤝 Biblioteca Colaborativa**
   - Compartir apuntes con la comunidad
   - Sistema de descarga y calificaciones
   - Filtros por materia, universidad, carrera
   - Estadísticas de uso

4. **⏰ Herramientas de Estudio**
   - Temporizador Pomodoro completamente funcional
   - Configuración personalizable (tiempos, ciclos)
   - Notificaciones del navegador
   - Tracking de sesiones completadas

5. **📊 Dashboard Intuitivo**
   - Estadísticas personales
   - Actividad reciente
   - Próximos eventos
   - Accesos rápidos

6. **📱 Diseño Responsive**
   - Optimizado para móviles, tablets y desktop
   - Interfaz moderna con Tailwind CSS
   - Navegación lateral colapsible

### 🔮 Funcionalidades preparadas (coming soon):
- Flashcards inteligentes
- Planificador de calendario
- Sistema de progreso y logros
- Foros de discusión

## 🚀 Configuración Inicial

### 1. Configurar Firebase

#### A. Crear proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Crear proyecto"
3. Nombre: "eestudiantes" (o el que prefieras)
4. Habilita Google Analytics (opcional)

#### B. Configurar Authentication
1. En el panel izquierdo: **Authentication**
2. Pestaña **Sign-in method**
3. Habilitar **Correo electrónico/contraseña**
4. Habilitar **Google**:
   - Configurar nombre y email del proyecto
   - Descargar configuración OAuth

#### C. Configurar Firestore Database
1. En el panel izquierdo: **Firestore Database**
2. Clic en **Crear base de datos**
3. Modo: **Empezar en modo de prueba** (cambiaremos reglas después)
4. Ubicación: **us-central** (o la más cercana)

#### D. Configurar Storage
1. En el panel izquierdo: **Storage**
2. Clic en **Comenzar**
3. Acepta las reglas predeterminadas
4. Selecciona la misma ubicación que Firestore

#### E. Obtener credenciales
1. En **Configuración del proyecto** (ícono engranaje)
2. Pestaña **General**
3. En "Tus aplicaciones", clic en **</> Web**
4. Nombre de la app: "E-Estudiantes Web"
5. Copiar el objeto `firebaseConfig`

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
```

### 3. Instalar y Ejecutar

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en: http://localhost:3000

## 🔒 Configurar Reglas de Seguridad

### Reglas de Firestore
En Firebase Console > Firestore Database > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Notas - los usuarios pueden crear/editar sus propias notas
    // y leer notas públicas
    match /notes/{noteId} {
      allow read: if request.auth != null && 
        (resource.data.isPublic == true || resource.data.uploadedBy == request.auth.uid);
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uploadedBy;
      allow update: if request.auth != null && 
        request.auth.uid == resource.data.uploadedBy;
      allow delete: if request.auth != null && 
        request.auth.uid == resource.data.uploadedBy;
    }
  }
}
```

### Reglas de Storage
En Firebase Console > Storage > Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Archivos personales - solo el propietario
    match /personal/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Archivos compartidos - todos pueden leer, solo propietario puede escribir
    match /shared/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🌐 Deployment en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit: E-Estudiantes platform"
git branch -M main
git remote add origin https://github.com/tu-usuario/eestudiantes.git
git push -u origin main
```

### 2. Conectar con Vercel
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Clic en **"Import Project"**
3. Selecciona tu repositorio GitHub
4. Configuración automática detectará Next.js

### 3. Configurar Variables de Entorno en Vercel
En Vercel Dashboard > Settings > Environment Variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY = tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = tu_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = tu_app_id
```

### 4. Deploy
1. Clic en **Deploy**
2. Esperar a que termine el proceso
3. Tu app estará disponible en: `https://tu-proyecto.vercel.app`

### 5. Configurar dominio OAuth (importante)
1. En Google Cloud Console, ir a **Credenciales**
2. Editar cliente OAuth para web
3. Agregar a **URIs de redirección autorizados**:
   - `https://tu-proyecto.vercel.app`
   - `https://tu-project-id.firebaseapp.com/__/auth/handler`

## 📱 Funcionalidades de la App

### Para Estudiantes:
1. **Registro**: Crear cuenta con email/contraseña o Google
2. **Subir Apuntes**: Archivos hasta 10MB con metadatos
3. **Organizar**: Etiquetas, materias, universidad, carrera
4. **Buscar**: Filtros avanzados en biblioteca colaborativa
5. **Estudiar**: Usar temporizador Pomodoro personalizable
6. **Compartir**: Hacer públicos los apuntes para la comunidad

### Panel de Control:
- **Dashboard**: Estadísticas personales y actividad reciente
- **Mi Biblioteca**: Gestión de apuntes personales
- **Biblioteca Colaborativa**: Explorar apuntes compartidos
- **Herramientas**: Pomodoro y herramientas de estudio
- **Configuración**: Perfil y preferencias

## 🔧 Personalización y Extensión

### Agregar nuevas funcionalidades:
1. **Flashcards**: Implementar en `src/components/study-tools/`
2. **Planificador**: Expandir `src/app/planner/`
3. **Foros**: Crear nueva sección de discusión
4. **API**: Agregar endpoints en `src/app/api/`

### Modificar estilos:
- Colores: Editar `tailwind.config.js`
- Componentes: Archivo `src/components/ui/`
- Layout: Modificar `src/components/layout/`

### Base de datos:
- Nuevas colecciones: Agregar a Firebase Firestore
- Tipos: Definir en `src/types/index.ts`
- Servicios: Expandir `src/lib/`

## 🐛 Troubleshooting

### Errores comunes:
1. **Firebase not initialized**: Verificar variables de entorno
2. **Permission denied**: Revisar reglas de Firestore/Storage
3. **OAuth error**: Configurar dominios autorizados
4. **Build failed**: Verificar tipos TypeScript

### Logs y debugging:
- Console del navegador para errores de cliente
- Vercel Dashboard > Functions > Logs para errores de server
- Firebase Console > Authentication/Firestore para logs de backend

## 📞 Soporte

¿Necesitas ayuda? 
- 📧 Documentación: [Next.js](https://nextjs.org/docs), [Firebase](https://firebase.google.com/docs)
- 🔧 Issues: Crear issue en el repositorio GitHub
- 💬 Comunidad: Stack Overflow con tags `nextjs`, `firebase`

## 🎉 ¡Felicitaciones!

Has creado exitosamente **E-Estudiantes**, una plataforma completa que incluye:

✅ Autenticación segura  
✅ Gestión de archivos  
✅ Biblioteca colaborativa  
✅ Herramientas de estudio  
✅ Dashboard interactivo  
✅ Diseño responsive  
✅ Deploy automatizado  

**¡Tu plataforma está lista para ayudar a miles de estudiantes a potenciar sus estudios!** 🚀📚

---

**E-Estudiantes** - Potenciando el futuro de la educación colaborativa ✨