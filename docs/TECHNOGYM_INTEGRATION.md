# 🏋️ Integración Technogym Mywellness Cloud

## Índice
1. [Visión General](#visión-general)
2. [Método de Integración: Server-to-Server (S2S)](#método-de-integración-server-to-server-s2s)
3. [Configuración](#configuración)
4. [Autenticación](#autenticación)
5. [Endpoints Implementados](#endpoints-implementados)
6. [Flujos de Uso](#flujos-de-uso)
7. [API Reference](#api-reference)
8. [Credenciales de Test](#credenciales-de-test)
9. [Notas Importantes](#notas-importantes)

---

## Visión General

### ¿Qué es Technogym Mywellness Cloud?

Technogym Mywellness Cloud es la plataforma en la nube de Technogym que:
- Registra automáticamente cada entrenamiento realizado en equipos Technogym
- Almacena datos biométricos (peso, grasa corporal, masa muscular)
- Gestiona programas de entrenamiento personalizados
- Sincroniza datos entre equipos, app móvil y cloud

### ¿Por qué integrar Haltere con Technogym?

Club Haltere utiliza equipamiento Technogym. Al integrar ambas plataformas:

| Beneficio | Descripción |
|-----------|-------------|
| **Sincronización de membresías** | Cuando un miembro se une a Haltere, se crea automáticamente en Technogym |
| **Acceso a equipos** | El miembro puede usar los equipos Technogym con sus credenciales |
| **Registro de visitas** | Las visitas al club se registran en ambos sistemas |
| **Gestión centralizada** | Admin puede gestionar usuarios desde el panel de Haltere |

---

## Método de Integración: Server-to-Server (S2S)

Usamos el modelo **Server-to-Server** de Technogym según la documentación oficial:

- 📚 **Documentación**: [apidocs.mywellness.com](https://apidocs.mywellness.com)
- 🔧 **Colecciones Postman**: MANDATORY STEPS + INTERACTION EXAMPLES

### Características del Método S2S

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARQUITECTURA S2S                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Haltere API (Vercel)          Technogym API (Mywellness)      │
│         │                              │                         │
│         │  1. AccessIntegration        │                         │
│         │  ────────────────────────────>                         │
│         │  { apiKey, username, password }                        │
│         │                              │                         │
│         │  2. Token de sesión          │                         │
│         │  <────────────────────────────                         │
│         │  { token, facilities[] }                               │
│         │                              │                         │
│         │  3. CreateUser, SaveMembership, etc.                   │
│         │  ────────────────────────────>                         │
│         │  { ...datos, token }                                   │
│         │                              │                         │
│         │  4. Respuesta + nuevo token  │                         │
│         │  <────────────────────────────                         │
│         │                              │                         │
└─────────────────────────────────────────────────────────────────┘
```

### ⚠️ Limitaciones del Método S2S

| Función | Disponible |
|---------|------------|
| Crear usuarios | ✅ Sí |
| Actualizar usuarios | ✅ Sí |
| Eliminar usuarios | ✅ Sí |
| Gestionar membresías | ✅ Sí |
| Registrar visitas | ✅ Sí |
| Buscar por permanentToken | ✅ Sí |
| Buscar por externalId | ✅ Sí |
| Obtener detalles de usuario | ✅ Sí (por facilityUserId) |
| Matching de usuarios existentes | ✅ Sí (via CreateUser) |
| Listar todos los usuarios | ❌ No (ver sync inicial abajo) |
| Obtener workouts | ❌ No (automático vía equipos) |
| Obtener biometría | ❌ No (automático vía equipos) |
| Obtener programas de entrenamiento | ❌ No |

> **Nota**: Los datos de workouts y biometría se sincronizan automáticamente cuando el usuario usa los equipos Technogym. No se acceden via API.

---

## Sincronización Inicial de Usuarios

La API S2S **no permite listar todos los usuarios** de una facility. Para obtener la lista completa de usuarios existentes, se debe seguir este proceso manual:

### Proceso de Exportación desde Portal PRO

```
┌─────────────────────────────────────────────────────────────────┐
│                  SINCRONIZACIÓN INICIAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Acceder a pro.mywellness.com con credenciales de Director   │
│     Usuario: director.gymvillagetest@gmail.com                   │
│                         │                                        │
│                         ▼                                        │
│  2. Ir a sección "Contactos" o "Members"                         │
│                         │                                        │
│                         ▼                                        │
│  3. Exportar lista completa en formato XLS/CSV                   │
│                         │                                        │
│                         ▼                                        │
│  4. Importar el archivo en Haltere (proceso manual o script)     │
│     - Extraer: userId, email, nombre, etc.                       │
│                         │                                        │
│                         ▼                                        │
│  5. Para cada usuario, usar matchUserByData() para obtener:      │
│     - permanentToken                                             │
│     - facilityUserId                                             │
│     - userId                                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Método de Matching (Coincidencia)

El endpoint `CreateFacilityUserFromThirdParty` implementa una **lógica de coincidencia (Matching Logic)** para evitar duplicados:

#### Campos de Matching
La API considera que un usuario ya existe si coinciden **exactamente**:
- `firstName` (nombre)
- `lastName` (apellido)
- `gender` (género)
- `dateOfBirth` (fecha de nacimiento)

#### Escenarios de Respuesta

| Resultado | Descripción | Acción |
|-----------|-------------|--------|
| `Created` | Usuario nuevo creado | Guardar IDs y permanentToken |
| `MatchFound` | Coincidencia única encontrada | Usar datos del usuario existente |
| `UserEmailAndDataMatchFound` | Múltiples coincidencias | Seleccionar usuario correcto manualmente |

#### Respuesta para Múltiples Coincidencias (409 Conflict)

Si hay múltiples usuarios con los mismos datos básicos:

```json
{
  "success": false,
  "result": "UserEmailAndDataMatchFound",
  "matchedUsers": [
    { "userId": "xxx", "facilityUserId": "yyy", "email": "j***@example.com" },
    { "userId": "aaa", "facilityUserId": "bbb", "email": "ju***@other.com" }
  ],
  "requiresSelection": true
}
```

El administrador debe seleccionar el usuario correcto basándose en el email ofuscado.

```typescript
// Ejemplo de uso con matching automático
const result = await createUser({
  firstName: 'Juan',
  lastName: 'Pérez', 
  email: 'juan@ejemplo.com',
  dateOfBirth: '1990-05-15',
  gender: 'M'
});

if (result.success) {
  // Caso Created o MatchFound
  console.log('Usuario:', result.userId);
  console.log('Existente:', result.isExisting);
} else {
  // Caso UserEmailAndDataMatchFound - requiere intervención
  console.log('Múltiples usuarios encontrados:', result.matchedUsers);
}
```

### Webhooks para Sincronización en Tiempo Real

Technogym soporta **webhooks** para notificar cambios en usuarios.

#### Endpoint Haltere para Webhooks:
```
POST https://haltere-api-lightningteam.vercel.app/api/technogym/webhook
```

#### Evento: Facility User Creation

Este evento se dispara cuando se crea un nuevo usuario en la facility (leads, prospects, members).

| Campo | Descripción | Notas |
|-------|-------------|-------|
| `facility_url` | URL de la Facility | |
| `facility_name` | Nombre de la Facility | |
| `facility_lat` | Latitud geo | |
| `facility_lon` | Longitud geo | |
| `facility_user_status` | Estado del usuario | 0=Lead, 5=Prospect, 7=Ex Member, 10=Member |
| `facility_user_id` | ID del usuario en Facility | |
| `facility_user_externalId` | ID externo (Haltere) | Nuestro UUID de usuario |
| `when_utc` | Fecha de creación | Formato UTC |
| `by_application` | Aplicación que creó el usuario | `thirdparties` si fue creado por nosotros |

**Ejemplo de payload:**
```json
{
  "facility_url": "gymvillagetest",
  "facility_name": "Gym Village Test club",
  "facility_lat": 45.4654,
  "facility_lon": 9.1859,
  "facility_user_status": 10,
  "facility_user_id": "1a26fb12-710e-49ac-a567-bbe1ca6990a5",
  "facility_user_externalId": "haltere-uuid-123",
  "when_utc": "2026-02-10T14:30:00Z",
  "by_application": "thirdparties"
}
```

**Comportamiento del webhook:**
- Si `facility_user_externalId` coincide con un `user_id` de Haltere, se vincula automáticamente
- Los usuarios creados desde Haltere (vía API S2S) ya incluyen el `externalId`
- El webhook siempre retorna 200 para evitar reintentos de Technogym

> **Configuración**: Los webhooks se configuran desde el portal de administración de Technogym o contactando soporte técnico.

---

## Configuración

### Variables de Entorno

```bash
# Agregar en Vercel o .env.local

# Credenciales proporcionadas por Technogym
TECHNOGYM_API_KEY=5caa423d-7c01-4ff3-85a0-6d6076c9dfa2
TECHNOGYM_FACILITY_URL=gymvillagetest
TECHNOGYM_USERNAME=integration.gymvillagetest@gmail.com
TECHNOGYM_PASSWORD=TEST123gymvillagetes

# Entorno: 'development' o 'production'
TECHNOGYM_ENV=development
```

### URLs Base

| Entorno | URL |
|---------|-----|
| Development | `https://api-dev.mywellness.com` |
| Production | `https://api.mywellness.com` |

---

## Autenticación

### Endpoint de Autenticación

```http
POST /{facilityUrl}/application/{applicationId}/AccessIntegration

Headers:
  Content-Type: application/json
  X-MWAPPS-CLIENT: thirdParties
  X-MWAPPS-APIKEY: {apiKey}

Body:
{
  "apiKey": "{apiKey}",
  "username": "{integrationUsername}",
  "password": "{integrationPassword}"
}
```

### Respuesta Exitosa

```json
{
  "data": {
    "facilities": [{
      "id": "d7733b26-b0ce-486d-9337-2af272d354d0",
      "url": "gymvillagetest",
      "name": "Gym Village Test club"
    }],
    "accountConfirmed": true,
    "result": "Success"
  },
  "token": "MjAyNjAyMT...",
  "expireIn": 1800
}
```

### Gestión del Token

- El token **expira en 30 minutos** (`expireIn: 1800`)
- Cada request devuelve un **nuevo token** que debe usarse para el siguiente request
- El cliente de Haltere **cachea el token por 25 minutos** para evitar llamadas innecesarias
- El token se pasa en el **body** de cada request, no en headers

---

## Endpoints Implementados

### 1. Crear Usuario

```http
POST /{facilityUrl}/core/facility/{facilityId}/CreateFacilityUserFromThirdParty

Body:
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "dateOfBirth": "1990-05-15",
  "gender": "M",
  "externalId": "haltere-uuid-123",
  "token": "{sessionToken}"
}
```

**Respuesta:**
```json
{
  "data": {
    "result": "Created",
    "userId": "12910d1a-0266-4cbd-a9f6-d474549b677f",
    "facilityUserId": "1a26fb12-710e-49ac-a567-bbe1ca6990a5",
    "permanentToken": "X0NWNhYTQy..."
  },
  "token": "{newSessionToken}"
}
```

### 2. Obtener Usuario por Permanent Token

```http
POST /{facilityUrl}/core/facility/{facilityId}/GetFacilityUserFromPermanentToken

Body:
{
  "permanentToken": "X0NWNhYTQy...",
  "token": "{sessionToken}"
}
```

### 3. Obtener Usuario por External ID

```http
POST /{facilityUrl}/core/facility/{facilityId}/GetFacilityUserFromExternalId

Body:
{
  "externalId": "haltere-uuid-123",
  "token": "{sessionToken}"
}
```

### 4. Actualizar Usuario

```http
POST /{facilityUrl}/core/facilityuser/{facilityUserId}/Update

Body:
{
  "firstName": "Juan Carlos",
  "notes": "VIP member",
  "levelOfInterest": "VeryInterested",
  "address1": "Calle Principal 123",
  "city": "Santiago",
  "token": "{sessionToken}"
}
```

### 5. Guardar Membresía

```http
POST /{facilityUrl}/core/facilityuser/{facilityUserId}/SaveMembership

Body:
{
  "operation": "Subscribe",
  "memberSince": "2026-02-10",
  "startOn": "2026-02-10",
  "expiresOn": "2027-02-10",
  "description": "Club Haltere - Annual Membership",
  "token": "{sessionToken}"
}
```

**Operaciones disponibles:**
- `Subscribe` - Nueva suscripción
- `Renew` - Renovar suscripción
- `UnSubscribe` - Cancelar suscripción
- `Update` - Actualizar detalles
- `Froze` - Congelar suscripción
- `UnFroze` - Descongelar suscripción

### 6. Registrar Visita

```http
POST /{facilityUrl}/core/user/{userId}/Visit

Body:
{
  "visitDate": "2026-02-10 09:30:00 -03:00",
  "token": "{sessionToken}"
}
```

### 7. Eliminar Usuario

```http
POST /{facilityUrl}/core/facilityuser/{facilityUserId}/Delete

Body:
{
  "token": "{sessionToken}"
}
```

---

## Flujos de Uso

### Flujo 1: Onboarding de Nuevo Miembro

```
┌─────────────────────────────────────────────────────────────────┐
│                 ONBOARDING NUEVO MIEMBRO                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Admin aprueba solicitud de membresía en Haltere              │
│                         │                                        │
│                         ▼                                        │
│  2. Se crea usuario en Supabase con externalId                   │
│                         │                                        │
│                         ▼                                        │
│  3. Llamar onboardNewMember() que ejecuta:                       │
│     a) CreateFacilityUserFromThirdParty                          │
│     b) Update (con datos adicionales)                            │
│     c) SaveMembership (Subscribe)                                │
│                         │                                        │
│                         ▼                                        │
│  4. Guardar permanentToken y facilityUserId en Supabase          │
│                         │                                        │
│                         ▼                                        │
│  5. Miembro puede usar equipos Technogym ✅                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo 2: Sincronizar Estado de Membresía

```
┌─────────────────────────────────────────────────────────────────┐
│              SINCRONIZAR ESTADO MEMBRESÍA                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cuando la membresía en Haltere cambia:                          │
│                                                                  │
│  • Renovación → SaveMembership(operation: 'Renew')               │
│  • Cancelación → SaveMembership(operation: 'UnSubscribe')        │
│  • Congelamiento → SaveMembership(operation: 'Froze')            │
│  • Reactivación → SaveMembership(operation: 'UnFroze')           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flujo 3: Registrar Visita

```
┌─────────────────────────────────────────────────────────────────┐
│                    REGISTRAR VISITA                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cuando el miembro hace check-in en el club:                     │
│                                                                  │
│  1. Obtener userId de Technogym (via permanentToken o externalId)│
│  2. Llamar registerVisit(userId)                                 │
│  3. La visita queda registrada en Mywellness                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Reference

### Haltere API Endpoints

#### GET /api/admin/technogym

| Param | Descripción |
|-------|-------------|
| `action=status` | Verificar configuración |
| `action=test` | Probar autenticación |
| `permanentToken={token}` | Buscar usuario por token |
| `externalId={id}` | Buscar usuario por ID de Haltere |

#### POST /api/admin/technogym

```json
// Crear usuario
{
  "action": "create",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "externalId": "haltere-uuid"
}

// Onboarding completo (crear + membresía)
{
  "action": "onboard",
  "firstName": "Juan",
  "lastName": "Pérez",
  "email": "juan@ejemplo.com",
  "externalId": "haltere-uuid",
  "membershipStartOn": "2026-02-10",
  "membershipExpiresOn": "2027-02-10"
}

// Guardar membresía
{
  "action": "membership",
  "facilityUserId": "xxx",
  "operation": "Subscribe",
  "startOn": "2026-02-10",
  "expiresOn": "2027-02-10"
}

// Registrar visita
{
  "action": "visit",
  "userId": "xxx",
  "visitDate": "2026-02-10 09:30:00 -03:00"
}

// Eliminar usuario
{
  "action": "delete",
  "facilityUserId": "xxx"
}
```

---

## Credenciales de Test

Credenciales proporcionadas por Technogym para desarrollo:

| Campo | Valor |
|-------|-------|
| Facility Name | Gym Village Test club |
| ApiKey | `5caa423d-7c01-4ff3-85a0-6d6076c9dfa2` |
| FacilityUrl | `gymvillagetest` |
| Integration Username | `integration.gymvillagetest@gmail.com` |
| Integration Password | `TEST123gymvillagetes` |
| Director Username | `director.gymvillagetest@gmail.com` |
| Director Password | `TEST123gymvillagetes` |

**Nota**: Estas credenciales son para el entorno de **development** (`api-dev.mywellness.com`)

---

## Notas Importantes

### IDs Importantes

Cada usuario tiene múltiples IDs:

| ID | Descripción | Uso |
|----|-------------|-----|
| `userId` | ID global de Mywellness Cloud | Para registrar visitas |
| `facilityUserId` | ID del usuario en la facility | Para update, membership, delete |
| `permanentToken` | Token único persistente | Para recuperar usuario después |
| `externalId` | ID de Haltere (nuestro UUID) | Para vincular sistemas |

### Tokens de Sesión

- El token de sesión cambia con cada request
- Siempre usar el último token recibido
- El cliente de Haltere maneja esto automáticamente

### Sincronización de Datos

- Los datos de **workouts** se sincronizan automáticamente cuando el usuario entrena
- Los datos de **biometría** se sincronizan cuando el usuario usa la báscula inteligente
- No hay API para obtener estos datos - fluyen automáticamente al usuario en Mywellness

### Rate Limits

- No hay rate limits documentados, pero usar con moderación
- Cachear resultados cuando sea posible
- Evitar polling frecuente

### Seguridad

- Las credenciales **nunca** se exponen al frontend
- Toda comunicación es Server-to-Server
- El `permanentToken` del usuario debe guardarse de forma segura en Supabase

---

## Recursos

- 📚 [Documentación API](https://apidocs.mywellness.com)
- 📧 Contacto Technogym: soporte técnico para integraciones
- 🔧 Postman Collections: MANDATORY STEPS + INTERACTION EXAMPLES