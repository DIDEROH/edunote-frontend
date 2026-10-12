import { RESPONSES, idbClear, idbGet, idbPut, idbTrimOldest } from "./db";

/**
 * Cache des réponses de l'API pour la consultation hors ligne.
 *
 * On met en cache toutes les lectures (GET) ainsi que les quelques routes
 * de lecture exposées en POST (liste des élèves filtrée, génération des
 * bulletins). Les autres POST/PUT/DELETE ne sont jamais rejoués depuis le cache.
 */
const READ_ONLY_POSTS = ["/student_enrollments", "/reports/generate"];
const MAX_ENTRIES = 400;
const TRIM_EVERY = 25;

let writesSinceTrim = 0;

const normalizePath = (url = "") => "/" + String(url).split("?")[0].replace(/^\/+/, "");

export function isCacheable(config = {}) {
  if (config.offlineCache === false) return false;

  const method = (config.method || "get").toLowerCase();
  if (method === "get") return true;

  return method === "post" && READ_ONLY_POSTS.includes(normalizePath(config.url));
}

// Sérialisation stable (clés triées) pour qu'un même appel donne toujours la même clé
function stableStringify(value) {
  if (value === undefined || value === null || value === "") return "";

  let parsed = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      return value;
    }
  }

  if (typeof parsed !== "object") return String(parsed);
  if (Array.isArray(parsed)) return `[${parsed.map(stableStringify).join(",")}]`;

  return `{${Object.keys(parsed)
    .sort()
    .filter((key) => parsed[key] !== undefined && parsed[key] !== null && parsed[key] !== "")
    .map((key) => `${key}:${stableStringify(parsed[key])}`)
    .join(",")}}`;
}

function cacheKey(config) {
  const method = (config.method || "get").toUpperCase();
  return `${method} ${config.url}?${stableStringify(config.params)}#${stableStringify(config.data)}`;
}

export async function saveResponse(config, data) {
  try {
    await idbPut(RESPONSES, { key: cacheKey(config), data, savedAt: Date.now() });

    if (++writesSinceTrim >= TRIM_EVERY) {
      writesSinceTrim = 0;
      await idbTrimOldest(RESPONSES, MAX_ENTRIES);
    }
  } catch {
    // Le cache hors ligne est un bonus : un échec de stockage ne doit jamais bloquer l'appli.
  }
}

export async function readResponse(config) {
  try {
    return (await idbGet(RESPONSES, cacheKey(config))) ?? null;
  } catch {
    return null;
  }
}

export async function clearResponses() {
  try {
    await idbClear(RESPONSES);
  } catch {
    // ignore
  }
}
