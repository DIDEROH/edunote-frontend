/**
 * Extrait les premières lettres de chaque mot d'une chaîne de caractères (Acronyme/Initiales).
 * Exemple: "Gestion de Finances" -> "GF"
 * * @param {string} str - La chaîne à traiter
 * @param {number} limit - (Optionnel) Nombre maximum de lettres à retourner
 * @returns {string} - Les initiales en majuscules
 */
export const getInitials = (str, limit = 2) => {
  if (!str) return "";

  return str
    .trim()                                      // Supprime les espaces au début et à la fin
    .split(/\s+/)                                // Divise la chaîne par n'importe quel espace blanc
    .filter(word => word.length > 0)             // Ignore les éléments vides
    .map(word => word[0].toUpperCase())          // Récupère la première lettre en majuscule
    .slice(0, limit)                             // Limite le nombre de lettres (par défaut 2)
    .join("");                                   // Rejoint les lettres en une seule chaîne
};