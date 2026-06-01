/**
 * Formate une date en chaîne de caractères lisible (fr-FR).
 * @param {string|Date} dateInput - La date à formater
 * @returns {string|null} - La date formatée ou null si invalide
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return null;

  let d = new Date(dateInput);
  if (isNaN(d.getTime())) return null;

  // Détection de l'heure dans la chaîne d'origine (si c'est une string)
  let hasSignificantTime = false;
  if (typeof dateInput === 'string') {
    const timeMatch = dateInput.match(/(\d{2}):(\d{2})(?::\d{2})?/);
    hasSignificantTime = timeMatch
      ? !(parseInt(timeMatch[1], 10) === 0 && parseInt(timeMatch[2], 10) === 0)
      : false;

    // Ajustement UTC si nécessaire
    if (dateInput.endsWith('Z')) {
      d = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    }
  }

  const formattedDate = d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (hasSignificantTime) {
    const formattedTime = d.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${formattedDate} à ${formattedTime}`;
  }

  return formattedDate;
};