// Super-admin avgörs av e-postadress — ingen DB-kolumn behövs. Elias loggar in
// med sin vanliga e-post och får då global åtkomst i admin-portalen, till
// skillnad från företagsägare som bara ser sina egna företag.

export const SUPER_ADMIN_EMAIL = "elias.bengtsson@live.com";

export function isSuperAdmin(user: { email?: string | null } | null | undefined): boolean {
  return Boolean(user?.email && user.email.toLowerCase() === SUPER_ADMIN_EMAIL);
}
