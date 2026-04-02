# Role Switching Bidireccional

Permitir que cualquier usuario cambie entre los portales Worker y Employer desde el dropdown del avatar, sin perder datos ni crear una cuenta nueva. Los datos personales se comparten; los datos de empresa se crean solo cuando se necesitan.

## Decisiones de diseño

- **Perfil compartido + datos de empresa adicionales**: Los datos personales (nombre, teléfono, país, etc.) son los mismos para ambos roles. Al activar employer por primera vez se pide completar datos de empresa.
- **Bidireccional**: Worker puede cambiar a Employer y Employer puede cambiar a Worker.
- **Campo `active_role` en `profiles`**: El rol activo se persiste en la DB. El campo `role` original se mantiene como "rol de registro" pero ya no controla el routing.
- **Botón en el dropdown del avatar**: Ubicado entre el header del usuario y las opciones del menú.
- **Primera vez redirige a completar perfil**: Si no tiene datos del rol destino, redirige a la página de perfil correspondiente. Visitas posteriores van directo al dashboard.

## Base de datos

### Migración: agregar `active_role` a `profiles`

```sql
ALTER TABLE profiles
  ADD COLUMN active_role TEXT CHECK (active_role IN ('worker', 'employer'));

-- Inicializar active_role con el valor actual de role
UPDATE profiles SET active_role = role;

-- Hacer NOT NULL después de inicializar
ALTER TABLE profiles ALTER COLUMN active_role SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN active_role SET DEFAULT 'worker';
```

### Actualizar trigger `handle_new_user()`

Agregar en el INSERT del trigger:

```sql
-- Donde actualmente inserta role = _role, agregar:
active_role = _role
```

Esto asegura que nuevos usuarios tengan `active_role` igual a su rol de registro.

## Server Action: `switchRole`

Archivo: `src/lib/actions/role-switch.ts`

```typescript
"use server"

async function switchRole(): Promise<{ redirect: string }> {
  // 1. Obtener usuario autenticado
  // 2. Leer active_role actual de profiles
  // 3. Calcular nuevo rol (worker ↔ employer)
  // 4. UPDATE profiles SET active_role = nuevoRol
  // 5. Determinar redirect:
  //    - Si nuevo rol es 'employer':
  //      - No existe registro en companies → "/employer/company-profile"
  //      - Existe → "/employer/dashboard"
  //    - Si nuevo rol es 'worker':
  //      - profile_complete es false → "/profile"
  //      - Es true → "/dashboard"
  // 6. Retornar { redirect }
}
```

## Middleware

Archivo: `src/middleware.ts`

Cambiar todas las lecturas de `profile.role` por `profile.active_role`:

```typescript
// Antes:
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", user.id)
  .single();
const role = profile?.role;

// Después:
const { data: profile } = await supabase
  .from("profiles")
  .select("active_role")
  .eq("id", user.id)
  .single();
const role = profile?.active_role;
```

Los redirects y la lógica de protección de rutas se mantienen idénticos, solo cambia el campo leido.

## UI: Componente `RoleSwitchButton`

Archivo: `src/components/shared/role-switch-button.tsx`

- Componente client (`"use client"`)
- Props: `activeRole: "worker" | "employer"`
- Muestra "Cambiar a Empresa" (verde, icono Building2) cuando `activeRole === "worker"`
- Muestra "Cambiar a Worker" (azul, icono User) cuando `activeRole === "employer"`
- Subtexto contextual: "Publicar vacantes y contratar" / "Buscar empleos y aplicar"
- Al hacer click: llama al Server Action `switchRole`, luego `router.push(result.redirect)`
- Estado de loading mientras se procesa el cambio

## UI: Integración en TopBar

Archivo: `src/components/shared/top-bar.tsx`

- Agregar `RoleSwitchButton` dentro del `DropdownMenuContent`, entre el header del usuario (nombre + rol) y los items del menú (Mi Perfil, Configuración, Cerrar Sesión)
- Separado visualmente con un `DropdownMenuSeparator` arriba y abajo
- TopBar ya recibe `userRole` como prop; se usará para pasar a `RoleSwitchButton`

## Hook: `useProfile`

Archivo: `src/hooks/useProfile.ts`

- Agregar `active_role` al SELECT de la query: `.select("full_name, role, active_role, avatar_url")`
- `roleLabel` se basa en `active_role` en vez de `role`
- Agregar `activeRole` al objeto retornado
- Fallback: si `active_role` es null, usar `role`

## Layouts

Archivos: `src/app/(worker)/layout.tsx`, `src/app/(employer)/layout.tsx`

- Pasar `activeRole` (del hook `useProfile`) como prop a `TopBar`
- TopBar lo pasa a `RoleSwitchButton`

## Auth: callbacks y login

Archivos: `src/hooks/useAuth.ts`, `src/app/auth/callback/route.ts`

- Cambiar las queries de redirect post-login para leer `active_role` en vez de `role`
- Esto asegura que al hacer login, el usuario vuelve al portal del rol que tenía activo la última vez

## Flujo completo

### Worker cambia a Employer (primera vez)
1. Click "Cambiar a Empresa" en dropdown
2. Server Action: `UPDATE profiles SET active_role = 'employer'`
3. Query: `SELECT id FROM companies WHERE owner_id = user.id` → no existe
4. Redirect a `/employer/company-profile`
5. Middleware lee `active_role = 'employer'` → permite acceso a rutas employer
6. Usuario completa datos de empresa
7. Próxima vez que cambie → directo a `/employer/dashboard`

### Employer cambia a Worker
1. Click "Cambiar a Worker" en dropdown
2. Server Action: `UPDATE profiles SET active_role = 'worker'`
3. Query: `SELECT profile_complete FROM profiles` → true (ya tenía datos personales)
4. Redirect a `/dashboard`
5. Middleware lee `active_role = 'worker'` → permite acceso a rutas worker

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `supabase/migrations/00004_active_role.sql` | Nueva migración: agregar columna `active_role` |
| `src/lib/actions/role-switch.ts` | Nuevo: Server Action `switchRole` |
| `src/components/shared/role-switch-button.tsx` | Nuevo: componente del botón de cambio |
| `src/components/shared/top-bar.tsx` | Integrar `RoleSwitchButton` en dropdown |
| `src/middleware.ts` | Leer `active_role` en vez de `role` |
| `src/hooks/useProfile.ts` | Agregar `active_role` al fetch y retorno |
| `src/hooks/useAuth.ts` | Leer `active_role` en redirects post-login |
| `src/app/auth/callback/route.ts` | Leer `active_role` en redirect post-signup |
| `src/app/(worker)/layout.tsx` | Pasar `activeRole` al TopBar |
| `src/app/(employer)/layout.tsx` | Pasar `activeRole` al TopBar |
