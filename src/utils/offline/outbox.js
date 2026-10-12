import { OUTBOX, idbClear, idbDelete, idbGetAll, idbPut } from "./db";
import { OUTBOX_EVENT, getCurrentUserId } from "./status";

/**
 * File d'attente des enregistrements faits hors ligne.
 *
 * Volontairement réservée aux requêtes idempotentes (enregistrement d'une
 * grille de notes complète) : les rejouer plusieurs fois donne le même
 * résultat, sans risque de doublon. Chaque entrée appartient à un compte :
 * on n'envoie jamais les saisies d'un utilisateur avec la session d'un autre.
 */
const notify = () => window.dispatchEvent(new Event(OUTBOX_EVENT));

async function allEntries() {
  try {
    return await idbGetAll(OUTBOX);
  } catch {
    return [];
  }
}

export async function listOutbox(userId = getCurrentUserId()) {
  const entries = await allEntries();
  return entries
    .filter((entry) => entry.userId === userId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function pendingCount(userId = getCurrentUserId()) {
  return (await listOutbox(userId)).length;
}

export async function hasPending(dedupeKey, userId = getCurrentUserId()) {
  if (!dedupeKey) return false;
  return (await listOutbox(userId)).some((entry) => entry.dedupeKey === dedupeKey);
}

/**
 * Ajoute une requête à la file. Une nouvelle entrée avec la même
 * `dedupeKey` (même grille de notes) remplace la précédente : seule la
 * dernière version saisie sera envoyée.
 */
export async function enqueue({ method, url, data, label, dedupeKey, meta }) {
  const userId = getCurrentUserId();

  if (dedupeKey) {
    const previous = (await listOutbox(userId)).filter((entry) => entry.dedupeKey === dedupeKey);
    for (const entry of previous) {
      await idbDelete(OUTBOX, entry.id);
    }
  }

  await idbPut(OUTBOX, {
    method,
    url,
    data,
    label: label || "Enregistrement",
    dedupeKey: dedupeKey || null,
    meta: meta || {},
    userId,
    createdAt: Date.now(),
  });

  notify();
}

// Retire les entrées en attente d'une même grille (ex. enregistrée entre-temps en ligne)
export async function removeByDedupeKey(dedupeKey, userId = getCurrentUserId()) {
  if (!dedupeKey) return;
  const entries = (await listOutbox(userId)).filter((entry) => entry.dedupeKey === dedupeKey);
  for (const entry of entries) {
    await idbDelete(OUTBOX, entry.id);
  }
  if (entries.length) notify();
}

export async function removeEntry(id) {
  await idbDelete(OUTBOX, id);
  notify();
}

export async function clearOutbox() {
  try {
    await idbClear(OUTBOX);
  } finally {
    notify();
  }
}

// Supprime les entrées laissées par un autre compte sur cet appareil
export async function dropOtherUsersEntries(userId) {
  const entries = await allEntries();
  const foreign = entries.filter((entry) => entry.userId !== userId);
  for (const entry of foreign) {
    await idbDelete(OUTBOX, entry.id);
  }
  if (foreign.length) notify();
}
