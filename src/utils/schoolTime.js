/**
 * Dates de l'école à l'heure du Cameroun (dates limites de saisie, clôtures) :
 * les mêmes que celles calculées par l'API, quel que soit le fuseau de l'appareil.
 */
export const SCHOOL_TIME_ZONE = "Africa/Douala";

export const formatSchoolDate = (value) =>
  value ? new Date(value).toLocaleDateString("fr-FR", { timeZone: SCHOOL_TIME_ZONE }) : "";

export const formatSchoolDateTime = (value) =>
  value ? new Date(value).toLocaleString("fr-FR", { timeZone: SCHOOL_TIME_ZONE, dateStyle: "short", timeStyle: "short" }) : "";

/** Valeur d'un champ <input type="date"> (AAAA-MM-JJ) */
export const toSchoolDateInput = (value) =>
  value ? new Date(value).toLocaleDateString("fr-CA", { timeZone: SCHOOL_TIME_ZONE }) : "";

export const todaySchoolDateInput = () => toSchoolDateInput(new Date());
