# 🏋️ Integración Technogym Mywellness Cloud

## Índice
1. [Visión General](#visión-general)
2. [Arquitectura de la Integración](#arquitectura-de-la-integración)
3. [Flujo del Usuario](#flujo-del-usuario)
4. [Autenticación Server-to-Server](#autenticación-server-to-server)
5. [Estructura de Datos](#estructura-de-datos)
6. [API Endpoints](#api-endpoints)
7. [Casos de Uso](#casos-de-uso)
8. [Configuración](#configuración)

---

## Visión General

### ¿Qué es Technogym Mywellness Cloud?

Technogym Mywellness Cloud es la plataforma en la nube de Technogym que:
- Registra automáticamente cada entrenamiento realizado en equipos Technogym
- Almacena datos biométricos (peso, grasa corporal, masa muscular)
- Gestiona programas de entrenamiento personalizados
- Sincroniza datos entre equipos, app móvil y cloud

### ¿Por qué integrar Haltere con Technogym?

Club Haltere utiliza equipamiento Technogym en sus instalaciones. Al integrar ambas plataformas:

| Beneficio | Descripción |
|-----------|-------------|
| **Experiencia unificada** | El miembro ve todas sus estadísticas en la app Haltere |
| **Datos automáticos** | Los workouts se registran sin intervención manual |
| **Gamificación** | Rachas, logros y progreso visibles en el dashboard |
| **Historial completo** | Acceso a todo el historial de entrenamientos |

---

## Arquitectura de la Integración

```
┌──────────────────────────────────────────────────────────────────┐
│                    HALTERE ECOSYSTEM                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐ │
│  │   Mobile    │────▶│   Haltere   │────▶│   Technogym         │ │
│  │    App      │     │    API      │     │   Mywellness API    │ │
│  │  (Expo)     │◀────│  (Vercel)   │◀────│   (Cloud)           │ │
│  └─────────────┘     └─────────────┘     └─────────────────────┘ │
│         │                   │                      │              │
│         │                   │                      │              │
│         ▼                   ▼                      ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐ │
│  │   User      │     │  Supabase   │     │   Technogym         │ │
│  │  Interface  │     │  Database   │     │   Equipment         │ │
│  └─────────────┘     └─────────────┘     └─────────────────────┘ │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Tipo de Integración: Server-to-Server (S2S)

Usamos el modelo **Server-to-Server** de Technogym porque:

1. **No requiere intervención del usuario** para obtener datos
2. **Credenciales centralizadas** - el club gestiona el acceso
3. **Mayor seguridad** - tokens nunca expuestos al cliente
4. **Acceso completo** a todos los usuarios de la facility

```
                   FLUJO DE DATOS
                   
Usuario entrena    ─────▶  Equipo Technogym
                                  │
                                  ▼
                          Mywellness Cloud
                          (datos almacenados)
                                  │
                                  ▼
                   ┌──────────────────────────┐
                   │     Haltere API          │
                   │  (consulta periódica o   │
                   │   on-demand)             │
                   └──────────────────────────┘
                                  │
                                  ▼
                          Mobile App Haltere
                          (muestra estadísticas)
```

---

## Flujo del Usuario

### Paso 1: Registro en Club Haltere

```
┌─────────────────────────────────────────────────────────────┐
│                 ONBOARDING MEMBER                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Usuario aplica en haltere-api.vercel.app/apply          │
│                         │                                    │
│                         ▼                                    │
│  2. Admin aprueba membresía                                  │
│                         │                                    │
│                         ▼                                    │
│  3. Se crea perfil en Supabase (user_profiles)              │
│     └─ technogym_user_id: null (no vinculado)               │
│                         │                                    │
│                         ▼                                    │
│  4. Usuario recibe credenciales de acceso                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Paso 2: Configuración en Technogym (Primera visita al club)

```
┌─────────────────────────────────────────────────────────────┐
│               PRIMERA VISITA AL CLUB                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Miembro llega al club por primera vez                    │
│                         │                                    │
│                         ▼                                    │
│  2. Staff le crea cuenta en Mywellness                       │
│     └─ Usando el email de registro de Haltere               │
│     └─ Le asigna pulsera/tarjeta Technogym                  │
│                         │                                    │
│                         ▼                                    │
│  3. Miembro descarga app Mywellness (opcional)               │
│     └─ Para ver datos también desde Technogym               │
│                         │                                    │
│                         ▼                                    │
│  4. ¡Listo para entrenar!                                    │
│     └─ Los equipos reconocen automáticamente al usuario     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Paso 3: Vinculación Automática en Haltere

```
┌─────────────────────────────────────────────────────────────┐
│            VINCULACIÓN AUTOMÁTICA                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Cuando el miembro abre la sección "Mi Progreso" en la app: │
│                         │                                    │
│                         ▼                                    │
│  GET /api/technogym/stats?userId=xxx                        │
│                         │                                    │
│                         ▼                                    │
│  El backend:                                                 │
│  1. Busca el perfil del usuario en Supabase                 │
│  2. Si technogym_user_id es null:                           │
│     └─ Busca en Technogym por email                         │
│     └─ Si encuentra match: guarda el ID automáticamente     │
│     └─ Si no encuentra: retorna linked: false               │
│                         │                                    │
│                         ▼                                    │
│  Si está vinculado → muestra estadísticas                    │
│  Si NO está vinculado → muestra mensaje para vincular        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Paso 4: Experiencia Post-Vinculación

```
┌─────────────────────────────────────────────────────────────┐
│          EXPERIENCIA DIARIA DEL MIEMBRO                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              📱 APP HALTERE                          │    │
│  │                                                      │    │
│  │   ┌──────────────────────────────────────────────┐  │    │
│  │   │  🏆 Mi Progreso                              │  │    │
│  │   │                                               │  │    │
│  │   │  Racha actual: 🔥 5 días                     │  │    │
│  │   │  Este mes: 12 workouts | 4,500 kcal         │  │    │
│  │   │                                               │  │    │
│  │   │  ───────────────────────────────────────     │  │    │
│  │   │                                               │  │    │
│  │   │  Último entrenamiento: Hoy 8:30 AM          │  │    │
│  │   │  • Treadmill - 30 min - 320 kcal            │  │    │
│  │   │  • Chest Press - 15 min - 85 kcal           │  │    │
│  │   │  • Leg Press - 20 min - 110 kcal            │  │    │
│  │   │                                               │  │    │
│  │   │  ───────────────────────────────────────     │  │    │
│  │   │                                               │  │    │
│  │   │  📊 Biometría (última medición)              │  │    │
│  │   │  Peso: 78.5 kg | Grasa: 18.2%               │  │    │
│  │   │                                               │  │    │
│  │   └──────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Autenticación Server-to-Server

### Flujo de Autenticación

```
┌────────────────────────────────────────────────────────────────┐
│                 AUTHENTICATION FLOW                             │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Haltere API                          Technogym API             │
│      │                                     │                    │
│      │  POST /accessintegration            │                    │
│      │  {apiKey, username, password}       │                    │
│      │ ──────────────────────────────────▶ │                    │
│      │                                     │                    │
│      │  Response:                          │                    │
│      │  {accessToken, facilities[]}        │                    │
│      │ ◀────────────────────────────────── │                    │
│      │                                     │                    │
│      │  Token cached for 25 mins           │                    │
│      │  (expira a los 30 mins)             │                    │
│      │                                     │                    │
│      │  GET /results/facilityuser/:id      │                    │
│      │  Authorization: Bearer {token}      │                    │
│      │ ──────────────────────────────────▶ │                    │
│      │                                     │                    │
│      │  Workout data                       │                    │
│      │ ◀────────────────────────────────── │                    │
│      │                                     │                    │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Credenciales

| Variable | Descripción | Ubicación |
|----------|-------------|-----------|
| `TECHNOGYM_API_KEY` | API Key de la integración | Vercel Env |
| `TECHNOGYM_USERNAME` | Usuario del club en Mywellness | Vercel Env |
| `TECHNOGYM_PASSWORD` | Contraseña | Vercel Env |
| `TECHNOGYM_FACILITY_URL` | URL slug del club | Vercel Env |
| `TECHNOGYM_ENV` | `development` o `production` | Vercel Env |

---

## Estructura de Datos

### Tabla `user_profiles` (Supabase)

```sql
user_profiles
├── id                    UUID (PK)
├── user_id               UUID (FK → auth.users)
├── full_name             TEXT
├── phone                 TEXT
├── role                  user_role ENUM
├── member_status         member_status ENUM
├── membership_expires_at TIMESTAMP
├── technogym_user_id     TEXT          -- ← Nuevo campo
├── created_at            TIMESTAMP
└── updated_at            TIMESTAMP
```

### Datos de Technogym

```typescript
// Usuario Technogym
interface TechnogymUser {
  id: string;                 // ID interno de Technogym
  firstName: string;
  lastName: string;
  email: string;
  membershipNumber?: string;  // Número de membresía en el club
}

// Resultado de Workout
interface WorkoutResult {
  id: string;
  startDate: string;          // ISO 8601
  endDate: string;
  duration: number;           // segundos
  calories: number;
  distance?: number;          // metros
  avgHeartRate?: number;
  maxHeartRate?: number;
  equipmentType?: string;     // "TREADMILL", "BIKE", etc.
  equipmentName?: string;     // "Excite Run 700"
}

// Datos Biométricos
interface BiometricData {
  date: string;
  weight?: number;            // kg
  height?: number;            // cm
  bodyFat?: number;           // porcentaje
  muscleMass?: number;        // kg
  bmi?: number;
  visceralFat?: number;
  metabolicAge?: number;
}

// Estadísticas Calculadas
interface UserStats {
  totalWorkouts: number;
  totalCalories: number;
  totalDuration: number;      // segundos
  avgWorkoutDuration: number;
  currentStreak: number;      // días consecutivos
  longestStreak: number;
  lastWorkoutDate?: string;
  favoriteEquipment?: string;
}
```

---

## API Endpoints

### GET `/api/technogym/stats`

Obtiene las estadísticas de fitness del usuario.

**Request:**
```http
GET /api/technogym/stats?userId=xxx&period=month
```

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `userId` | UUID | ✅ | ID del usuario en Haltere |
| `period` | string | ❌ | `week`, `month` (default), `year` |

**Response (vinculado):**
```json
{
  "linked": true,
  "stats": {
    "totalWorkouts": 12,
    "totalCalories": 4850,
    "totalDuration": 36000,
    "avgWorkoutDuration": 3000,
    "currentStreak": 5,
    "longestStreak": 14,
    "lastWorkoutDate": "2026-02-08T08:30:00Z",
    "favoriteEquipment": "Treadmill"
  },
  "biometrics": {
    "date": "2026-02-05",
    "weight": 78.5,
    "bodyFat": 18.2,
    "muscleMass": 35.4,
    "bmi": 24.1
  },
  "activeProgram": {
    "id": "prog_123",
    "name": "Strength Builder",
    "completionPercentage": 67
  },
  "recentWorkouts": [
    {
      "id": "w_001",
      "date": "2026-02-08T08:30:00Z",
      "duration": 2700,
      "calories": 320,
      "equipment": "ARTIS Run"
    }
  ],
  "period": "month"
}
```

**Response (no vinculado):**
```json
{
  "linked": false,
  "message": "Technogym account not linked. Link your account in the app settings.",
  "stats": null,
  "workouts": [],
  "biometrics": null,
  "activeProgram": null
}
```

### POST `/api/technogym/stats`

Vincula manualmente una cuenta Technogym.

**Request:**
```http
POST /api/technogym/stats
Content-Type: application/json

{
  "userId": "uuid-del-usuario-haltere",
  "technogymUserId": "technogym-internal-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Technogym account linked successfully",
  "technogymUserId": "tg_user_123"
}
```

---

## Casos de Uso

### 1. Miembro nuevo que aún no está en Technogym

```
Usuario abre "Mi Progreso"
        │
        ▼
API busca perfil → technogym_user_id: null
        │
        ▼
API busca en Technogym por email → No encontrado
        │
        ▼
Retorna: { linked: false }
        │
        ▼
App muestra:
┌─────────────────────────────────────────┐
│  📊 Mi Progreso                         │
│                                         │
│  Tu cuenta Technogym aún no está        │
│  vinculada.                             │
│                                         │
│  Visita el club y pide al staff que     │
│  configure tu perfil en Mywellness.     │
│                                         │
│  Usa el mismo email: user@email.com     │
│                                         │
└─────────────────────────────────────────┘
```

### 2. Miembro ya configurado en Technogym (vinculación automática)

```
Usuario abre "Mi Progreso"
        │
        ▼
API busca perfil → technogym_user_id: null
        │
        ▼
API busca en Technogym por email → ¡Encontrado!
        │
        ▼
API actualiza user_profiles.technogym_user_id
        │
        ▼
API obtiene estadísticas de Technogym
        │
        ▼
Retorna: { linked: true, stats: {...} }
        │
        ▼
App muestra dashboard completo
```

### 3. Miembro ya vinculado (flujo normal)

```
Usuario abre "Mi Progreso"
        │
        ▼
API busca perfil → technogym_user_id: "tg_123"
        │
        ▼
API obtiene estadísticas de Technogym usando el ID
        │
        ▼
Retorna: { linked: true, stats: {...} }
        │
        ▼
App muestra dashboard con datos actualizados
```

### 4. Actualización de datos (después de entrenar)

```
Usuario termina entrenamiento en el club
        │
        ▼
Equipo Technogym envía datos a Mywellness Cloud
        │
        ▼
Usuario abre app Haltere (minutos después)
        │
        ▼
App llama GET /api/technogym/stats
        │
        ▼
API consulta Technogym → datos actualizados
        │
        ▼
Usuario ve su nuevo entrenamiento en el historial
```

---

## Configuración

### Variables de Entorno (Vercel)

```bash
# Agregar en Vercel Dashboard o CLI

TECHNOGYM_API_KEY=5caa423d-7c01-4ff3-85a0-6d6076c9dfa2
TECHNOGYM_FACILITY_URL=gymvillagetest
TECHNOGYM_USERNAME=integration.gymvillagetest@gmail.com
TECHNOGYM_PASSWORD=TEST123gymvillagetes
TECHNOGYM_ENV=development
```

### URLs Base

| Entorno | URL |
|---------|-----|
| Development | `https://api-dev.mywellness.com` |
| Production | `https://api.mywellness.com` |

### Endpoints de Technogym Utilizados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/accessintegration` | POST | Obtener token de acceso |
| `/core/facility/:id/facilityuser` | POST | Crear usuario |
| `/core/facilityuser/:id` | GET | Obtener usuario |
| `/core/facility/:id/facilityusers` | GET | Buscar usuarios |
| `/results/facilityuser/:id/workouts` | GET | Historial de workouts |
| `/biometrics/facilityuser/:id/measurements` | GET | Datos biométricos |
| `/trainingprogram/facilityuser/:id/programs` | GET | Programas de entrenamiento |

---

## Notas Importantes

### Seguridad
- Las credenciales de Technogym **nunca** se exponen al frontend
- Toda la comunicación es Server-to-Server
- Los tokens se cachean por 25 minutos para reducir llamadas

### Límites de la API
- La API de Technogym tiene rate limits
- Se recomienda cachear resultados para usuarios frecuentes
- No hacer polling constante; usar on-demand cuando el usuario abre la sección

### Sincronización de Emails
- Es **crítico** que el email usado en Haltere sea el mismo que en Mywellness
- Si difieren, la vinculación automática fallará
- En ese caso, se puede vincular manualmente via POST con el ID correcto

### Datos en Tiempo Real
- Los datos de workout se actualizan **en tiempo real** en Mywellness Cloud
- Puede haber un delay de segundos entre terminar el ejercicio y ver en la app
- Los datos biométricos se actualizan solo cuando el usuario usa la báscula inteligente