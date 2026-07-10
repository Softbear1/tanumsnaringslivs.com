// Register över inläggstyper. Lägg till nya format genom att implementera en
// PostTypeHandler och registrera den här — cron-routen och superadmin plockar
// upp den automatiskt via post_type.

import type { PostTypeHandler } from "./types";
import { presentationHandler } from "./presentation";

export const HANDLERS: Record<string, PostTypeHandler> = {
  [presentationHandler.type]: presentationHandler,
};

/** Standardtyp när ingen rad är förköad för dagen. */
export const DEFAULT_POST_TYPE = presentationHandler.type;

export function getHandler(type: string): PostTypeHandler | null {
  return HANDLERS[type] ?? null;
}

/** Typer som kan väljas i superadmin (etikett + värde). */
export function postTypeOptions(): Array<{ value: string; label: string }> {
  return Object.values(HANDLERS).map((h) => ({ value: h.type, label: h.label }));
}
