# 🔐 Sistema de Login - Documentación

## ✅ Componentes Creados

### 1. **Página de Login** (`/login`)
- ✅ Formulario de login profesional
- ✅ Validación de email
- ✅ Toggle para mostrar/ocultar contraseña
- ✅ Opción "Recordar sesión"
- ✅ Botones de acceso rápido (solo desarrollo)
- ✅ Diseño responsive

### 2. **Guard de Autenticación**
- ✅ Protege todas las rutas excepto `/login`
- ✅ Redirige a login si no está autenticado
- ✅ Guarda la URL de retorno para redirigir después del login

### 3. **AuthService Actualizado**
- ✅ Carga usuario desde localStorage al iniciar
- ✅ Guarda token y usuario después del login
- ✅ Limpia datos al hacer logout

---

## 🔌 Integración con Backend

### Endpoint Requerido

**POST** `/api/auth/login`

#### Request Body
```json
{
  "email": "usuario@empresa.com",
  "password": "contraseña123"
}
```

#### Response Exitosa (200)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "nombre": "Juan Pérez",
    "email": "juan@empresa.com",
    "rol": "admin"
  }
}
```

#### Response Error (401)
```json
{
  "message": "Credenciales incorrectas",
  "error": "UNAUTHORIZED"
}
```

#### Response Error (422 - Validación)
```json
{
  "message": "Error de validación",
  "errors": {
    "email": ["El email es requerido"],
    "password": ["La contraseña es requerida"]
  }
}
```

---

## 🔄 Flujo de Autenticación

### 1. Usuario accede a la aplicación
- Si no está autenticado → Redirige a `/login`
- Si está autenticado → Accede normalmente

### 2. Usuario hace login
1. Ingresa email y contraseña
2. Frontend valida formato de email
3. Hace petición POST a `/api/auth/login`
4. Backend valida credenciales
5. Si es exitoso:
   - Guarda token en `localStorage`
   - Guarda usuario en `localStorage`
   - Actualiza `AuthService`
   - Redirige a la página principal

### 3. Peticiones HTTP
- El interceptor agrega automáticamente: `Authorization: Bearer {token}`
- Si el token expira (401):
  - Limpia localStorage
  - Muestra notificación
  - Redirige a `/login`

### 4. Logout
- Limpia token y usuario de localStorage
- Actualiza `AuthService`
- Redirige a `/login`

---

## 🛡️ Protección de Rutas

Todas las rutas están protegidas con `authGuard`:

```typescript
{ path: 'productos', component: ProductosPage, canActivate: [authGuard] }
```

**Excepción:**
- `/login` - No requiere autenticación

---

## 📝 Uso del Login

### Para Usuarios

1. Acceder a la aplicación
2. Ser redirigido a `/login` si no está autenticado
3. Ingresar email y contraseña
4. Opcional: Marcar "Recordar sesión"
5. Click en "Iniciar Sesión"

### Para Desarrollo

El login incluye botones de acceso rápido (solo en desarrollo):
- **Admin** - Acceso como administrador
- **Vendedor** - Acceso como vendedor
- **Almacén** - Acceso como almacén
- **Contador** - Acceso como contador

**⚠️ IMPORTANTE:** Eliminar esta sección en producción.

---

## 🔧 Configuración del Backend

### 1. Endpoint de Login

```javascript
// Ejemplo en Node.js/Express
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // Validar datos
  if (!email || !password) {
    return res.status(422).json({
      message: 'Error de validación',
      errors: {
        email: !email ? ['El email es requerido'] : [],
        password: !password ? ['La contraseña es requerida'] : []
      }
    });
  }

  // Buscar usuario
  const user = await User.findOne({ where: { email } });
  
  if (!user) {
    return res.status(401).json({
      message: 'Credenciales incorrectas',
      error: 'UNAUTHORIZED'
    });
  }

  // Verificar contraseña
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    return res.status(401).json({
      message: 'Credenciales incorrectas',
      error: 'UNAUTHORIZED'
    });
  }

  // Generar token JWT
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      rol: user.rol 
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Retornar token y usuario
  res.json({
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  });
});
```

### 2. Validar Token en Peticiones

```javascript
// Middleware de autenticación
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

// Usar en rutas protegidas
app.get('/api/productos', authenticateToken, getProductos);
```

---

## 🎨 Características del Login

### Validaciones Frontend
- ✅ Email requerido
- ✅ Formato de email válido
- ✅ Contraseña requerida
- ✅ Feedback visual inmediato

### Características UX
- ✅ Toggle para mostrar/ocultar contraseña
- ✅ Opción "Recordar sesión"
- ✅ Loading state durante login
- ✅ Notificaciones de éxito/error
- ✅ Diseño responsive
- ✅ Animaciones suaves

### Seguridad
- ✅ Contraseña oculta por defecto
- ✅ Token almacenado en localStorage
- ✅ Limpieza automática en logout
- ✅ Redirección automática si token expira

---

## 📋 Checklist para Backend

- [ ] Endpoint `POST /api/auth/login` implementado
- [ ] Validación de email y contraseña
- [ ] Verificación de credenciales en base de datos
- [ ] Generación de token JWT
- [ ] Retorno de token y datos de usuario
- [ ] Manejo de errores (401, 422)
- [ ] Middleware de autenticación para rutas protegidas
- [ ] Validación de token en cada petición
- [ ] Manejo de expiración de token

---

## 🚀 Próximos Pasos (Opcional)

### 1. Refresh Token
- Renovar token automáticamente antes de expirar
- Endpoint: `POST /api/auth/refresh`

### 2. Recuperación de Contraseña
- Endpoint: `POST /api/auth/forgot-password`
- Endpoint: `POST /api/auth/reset-password`

### 3. Cambio de Contraseña
- Endpoint: `POST /api/auth/change-password`

### 4. Verificación de Email
- Endpoint: `POST /api/auth/verify-email`

---

## 📚 Archivos Creados/Modificados

### Nuevos
- `src/app/auth/login.page.ts`
- `src/app/auth/login.page.html`
- `src/app/auth/login.page.css`
- `src/app/guards/auth.guard.ts`
- `LOGIN_IMPLEMENTACION.md`

### Modificados
- `src/app/app.routes.ts` - Agregada ruta de login y guards
- `src/app/services/auth.service.ts` - Actualizado para manejar localStorage
- `src/app/interceptors/http.interceptor.ts` - Mejorado manejo de 401

---

## 💡 Tips

1. **Eliminar botones de desarrollo** antes de producción
2. **Configurar CORS** en el backend para permitir peticiones del frontend
3. **Usar HTTPS** en producción para proteger tokens
4. **Configurar expiración de tokens** según necesidades de seguridad
5. **Implementar rate limiting** en el endpoint de login

---

## ⚠️ Notas Importantes

1. **Los usuarios se crean en el backend** - El frontend solo maneja el login
2. **El token debe ser JWT** - Formato estándar para APIs
3. **El token debe incluir el rol** - Para verificación de permisos
4. **El interceptor maneja automáticamente** el token en todas las peticiones
5. **El guard protege todas las rutas** excepto `/login`

---

## 🎯 Estado Actual

✅ **Frontend completamente listo:**
- Página de login ✅
- Guard de autenticación ✅
- Integración con backend ✅
- Manejo de errores ✅
- UX profesional ✅

⏳ **Pendiente de backend:**
- Endpoint de login
- Validación de credenciales
- Generación de tokens JWT

