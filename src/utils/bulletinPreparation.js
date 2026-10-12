import { api } from "./AxiosClient";

/**
 * Préparation des bulletins côté serveur, un par un.
 *
 * Le serveur calcule les bulletins par petites étapes de quelques secondes
 * et les garde en cache : on ouvre (ou reprend) un lot, puis on demande les
 * étapes suivantes jusqu'à ce qu'il soit terminé. Si le serveur est déjà
 * occupé par une autre génération (busy), on patiente avant de réessayer.
 */
const BUSY_RETRY_MS = 2000;

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Préparation annulée", "AbortError"));
      },
      { once: true }
    );
  });

const isFinished = (batch) => ["completed", "failed"].includes(batch?.status);

/**
 * @param {{school_id?, classroom_id?, student_id?, term}} selection
 * @param {{onProgress?: (batch) => void, signal?: AbortSignal}} options
 * @returns {Promise<object>} le lot terminé
 */
export async function prepareBulletins(selection, { onProgress, signal } = {}) {
  const payload = Object.fromEntries(
    Object.entries({
      school_id: selection.school_id,
      classroom_id: selection.classroom_id,
      student_id: selection.student_id,
      term: selection.term,
    }).filter(([, value]) => value !== undefined && value !== null && value !== "")
  );

  let { data: batch } = await api.post("/reports/batches", payload, { signal });
  onProgress?.(batch);

  while (!isFinished(batch)) {
    if (batch.busy) await wait(BUSY_RETRY_MS, signal);
    ({ data: batch } = await api.post(`/reports/batches/${batch.id}/step`, {}, { signal }));
    onProgress?.(batch);
  }

  return batch;
}
