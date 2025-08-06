# 🚀 Guía de Deployment - E-Estudiantes

Esta guía te ayudará a desplegar E-Estudiantes en Vercel con todas las configuraciones necesarias.

## 📋 Pre-requisitos

1. **Cuenta de GitHub** con el repositorio creado
2. **Cuenta de Vercel** (gratuita)
3. **Proyecto de Firebase** configurado
4. **Código fuente** subido a GitHub

## 🔥 Configuración de Firebase

### 1. Crear proyecto en Firebase Console

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto llamado "eestudiantes"
3. Habilitar Google Analytics (opcional)

### 2. Configurar Authentication

1. En el panel de Firebase, ir a **Authentication**
2. Ir a **Sign-in method**
3. Habilitar **Email/Password**
4. Habilitar **Google** (configurar OAuth consent screen)

### 3. Configurar Firestore Database

1. Ir a **Firestore Database**
2. Crear base de datos en modo **test** (cambiar reglas después)
3. Seleccionar región más cercana

### 4. Configurar Storage

1. Ir a **Storage**
2. Inicializar con reglas por defecto
3. Seleccionar región más cercana

### 5. Obtener credenciales

1. Ir a **Project Settings** (ícono de engranaje)
2. En **General**, ir a **Your apps**
3. Agregar app web
4. Copiar las credenciales del objeto `firebaseConfig`

## 🌐 Deployment en Vercel

### 1. Conectar repositorio

1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Import Project"**
3. Seleccionar tu repositorio de GitHub
4. Configurar como proyecto Next.js

### 2. Configurar variables de entorno

En Vercel Dashboard, ir a **Settings > Environment Variables** y agregar:

```
NEXT_PUBLIC_FIREBASE_API_KEY = tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = tu_project_id.firebaseapp.com  
NEXT_PUBLIC_FIREBASE_PROJECT_ID = tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = tu_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID = tu_app_id
```

### 3. Configuración de build

Vercel detectará automáticamente Next.js, pero puedes verificar en **Settings > General**:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy

1. Click en **Deploy**
2. Esperar a que termine el proceso
3. Tu app estará disponible en `https://tu-proyecto.vercel.app`

## 🔒 Configuración de Seguridad Firebase

### Reglas de Firestore

Reemplazar las reglas por defecto en **Firestore > Rules**:

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

En **Storage > Rules**:

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

## 🔧 Configuraciones adicionales

### Dominio personalizado (opcional)

1. En Vercel Dashboard, ir a **Settings > Domains**
2. Agregar tu dominio personalizado
3. Configurar DNS según las instrucciones

### Configurar OAuth para Google Sign-in

1. En Google Cloud Console, configurar **OAuth consent screen**
2. Agregar el dominio de Vercel a **Authorized domains**
3. En **Credentials**, agregar la URL de Vercel a **Authorized redirect URIs**

### Variables de entorno adicionales

Para producción, puedes agregar:

```
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://tu-dominio.vercel.app
```

## 📊 Monitoreo y Analytics

### Vercel Analytics

1. En Vercel Dashboard, habilitar **Analytics**
2. Ver métricas de rendimiento y uso

### Firebase Analytics

1. En Firebase Console, ir a **Analytics**
2. Ver datos de usuarios y eventos

## 🚨 Troubleshooting

### Error: "Firebase config not found"
- Verificar que todas las variables de entorno estén configuradas
- Verificar que no haya espacios extra en las variables

### Error: "Permission denied" en Firestore
- Verificar que las reglas de seguridad estén configuradas
- Verificar que el usuario esté autenticado

### Error de CORS en Storage
- Verificar las reglas de Storage
- Verificar la configuración de dominios autorizados

### Build fallido en Vercel
- Verificar que no haya errores de TypeScript
- Verificar que todas las dependencias estén en package.json

## 📝 Post-deployment

### 1. Probar funcionalidades
- Registro de usuarios
- Login con email y Google
- Subida de archivos
- Compartir apuntes públicos

### 2. Configurar monitoreo
- Configurar alertas en Vercel
- Revisar logs de Firebase

### 3. Backup y mantenimiento
- Configurar backup automático de Firestore
- Revisar uso de Storage regularmente

## 🎉 ¡Listo!

Tu aplicación E-Estudiantes ahora está desplegada y lista para ser utilizada por estudiantes de todo el mundo.

### URLs importantes:
- **App en producción**: https://tu-proyecto.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com/

¿Necesitas ayuda? Consulta la documentación o abre un issue en GitHub.