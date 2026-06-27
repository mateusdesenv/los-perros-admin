import { initialMenu } from "../data/initialMenu";
import { normalizeImportedMenu } from "./format";

export const STORAGE_KEY = "los-perros-market-admin:v1";

export function loadMenu() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return initialMenu;

    return normalizeImportedMenu(JSON.parse(stored));
  } catch (error) {
    console.warn("Erro ao carregar dados do localStorage:", error);
    return initialMenu;
  }
}

export function saveMenu(menu) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menu));
}

export function clearMenu() {
  localStorage.removeItem(STORAGE_KEY);
}
