export type Rol = "admin" | "super_admin" | "operador" | "invitado";

export const ROLES_VALIDOS: Rol[] = ["admin", "super_admin", "operador"];

// admin local + super_admin compartido entre apps tienen los mismos permisos
export function esAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

// Para chequear si tiene acceso a la app
export function tieneAccesoApp(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin" || role === "operador";
}

// Extrae el rol de los sessionClaims de Clerk
export function extraerRol(claims: any): Rol {
  // Soporta: roles[] (Organizations), role (publicMetadata), metadata.role
  const raw = claims?.roles?.[0] ?? claims?.role ?? claims?.metadata?.role ?? "invitado";
  return (ROLES_VALIDOS.includes(raw) ? raw : "invitado") as Rol;
}

// Extrae empresaId opcional del publicMetadata de Clerk
export function extraerEmpresaId(claims: any): string | null {
  return claims?.empresa_id ?? claims?.metadata?.empresa_id ?? null;
}