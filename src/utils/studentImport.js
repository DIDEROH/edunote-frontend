/**
 * Import d'élèves depuis un fichier Excel (.xlsx, .xls, .ods, .csv).
 *
 * Le fichier est lu dans le navigateur (SheetJS, chargé à la demande pour ne
 * pas alourdir l'application), les colonnes sont reconnues d'après leur
 * en-tête (dans n'importe quel ordre), puis chaque ligne est normalisée et
 * vérifiée avec les mêmes règles que l'API pour un aperçu avant import.
 */
const loadXlsx = () => import("xlsx");

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
export const MAX_ROWS = 3000;
export const ACCEPTED_EXTENSIONS = ".xlsx,.xls,.ods,.csv";

// Colonnes du modèle téléchargeable (dans l'application : "Nom" = first_name, "Prénom" = last_name)
const TEMPLATE_HEADERS = ["Matricule", "Nom", "Prénom", "Sexe", "Date de naissance", "Lieu de naissance", "Contact parent", "Classe"];

// Minuscules, sans accents ni ponctuation : "Né(e) le" -> "ne e le"
const normalize = (value) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// En-têtes reconnus pour chaque champ (français, anglais, abréviations courantes)
const HEADER_ALIASES = {
  matricule: ["matricule", "mat", "n matricule", "no matricule", "num matricule", "numero matricule", "registration number", "reg no", "admission number"],
  first_name: ["nom", "noms", "nom de famille", "surname", "last name", "family name"],
  last_name: ["prenom", "prenoms", "first name", "first names", "given name", "given names", "other names"],
  full_name: ["noms et prenoms", "nom et prenom", "nom et prenoms", "noms et prenom", "nom prenom", "noms prenoms", "nom complet", "full name", "names", "name"],
  gender: ["sexe", "genre", "sex", "gender", "s"],
  birth_date: ["date de naissance", "date naissance", "date de naiss", "ne le", "nee le", "ne e le", "date of birth", "birth date", "dob"],
  birth_place: ["lieu de naissance", "lieu naissance", "lieu", "a", "ne a", "nee a", "ne e a", "place of birth", "birth place"],
  contact: ["contact", "contacts", "contact parent", "contact du parent", "contact tuteur", "contact parent tuteur", "telephone", "tel", "telephone parent", "tel parent", "phone", "parent contact"],
  classroom: ["classe", "class", "salle", "salle de classe"],
};

const FIELD_BY_HEADER = Object.fromEntries(
  Object.entries(HEADER_ALIASES).flatMap(([field, aliases]) => aliases.map((alias) => [alias, field]))
);

const FRENCH_MONTHS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8,
  septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

const pad = (n) => String(n).padStart(2, "0");

function isoDate(year, month, day) {
  const date = new Date(Date.UTC(year, month - 1, day));
  const valid = date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return valid ? `${year}-${pad(month)}-${pad(day)}` : null;
}

// Année sur 2 chiffres : 12 -> 2012, 98 -> 1998
const fullYear = (year) => {
  if (year >= 100) return year;
  const currentShort = new Date().getFullYear() % 100;
  return year <= currentShort ? 2000 + year : 1900 + year;
};

/**
 * Date de naissance : numéro de série Excel, objet Date, ou texte
 * (JJ/MM/AAAA, JJ-MM-AAAA, JJ.MM.AAAA, AAAA-MM-JJ, "12 mars 2012").
 */
function parseBirthDate(value, SSF) {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number") {
    const parts = SSF.parse_date_code(value);
    return parts ? isoDate(parts.y, parts.m, parts.d) : null;
  }

  if (value instanceof Date) {
    return isoDate(value.getFullYear(), value.getMonth() + 1, value.getDate());
  }

  const text = String(value).trim();
  let match = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) return isoDate(+match[1], +match[2], +match[3]);

  match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (match) return isoDate(fullYear(+match[3]), +match[2], +match[1]);

  match = normalize(text).match(/^(\d{1,2})(?: ?er)? ([a-z]+) (\d{2,4})$/);
  if (match && FRENCH_MONTHS[match[2]]) return isoDate(fullYear(+match[3]), FRENCH_MONTHS[match[2]], +match[1]);

  return null;
}

function parseGender(value) {
  const g = normalize(value);
  if (["m", "masculin", "masc", "garcon", "g", "h", "homme", "male", "boy"].includes(g)) return "M";
  if (["f", "feminin", "fem", "fille", "femme", "female", "girl"].includes(g)) return "F";
  return null;
}

// Texte de cellule (les matricules et téléphones numériques deviennent du texte)
function cellText(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

/**
 * Sépare une colonne "Noms et prénoms" : les mots en MAJUSCULES forment le
 * nom de famille, le reste le prénom (ex. "ESSOMBA Serge Paul").
 */
function splitFullName(fullName) {
  const words = fullName.split(" ").filter(Boolean);
  if (words.length < 2) return { first_name: fullName, last_name: "" };

  const isUpper = (word) => /[A-ZÀ-ÖØ-Þ]/.test(word) && word === word.toUpperCase();
  const firstLowerWord = words.findIndex((word) => !isUpper(word));

  // Pas de distinction possible par la casse : premier mot = nom, le reste = prénom
  const cut = firstLowerWord > 0 ? firstLowerWord : 1;
  return { first_name: words.slice(0, cut).join(" "), last_name: words.slice(cut).join(" ") };
}

// "6ème", "6eme", "6e" -> "6e" ; "1ère" -> "1e" (pour comparer les classes)
const normalizeClassroom = (value) => normalize(value).replace(/\b(\d+)\s*(?:ieme|eme|ere|er|e)\b/g, "$1e");

/**
 * Repère la ligne d'en-tête parmi les premières lignes (les listes ont
 * souvent un titre au-dessus du tableau) et associe chaque colonne à un champ.
 */
function detectHeader(matrix) {
  let best = { index: -1, columns: {}, score: 0 };

  matrix.slice(0, 15).forEach((row, index) => {
    const columns = {};
    row.forEach((cell, col) => {
      const field = FIELD_BY_HEADER[normalize(cell)];
      if (field && columns[field] === undefined) columns[field] = col;
    });
    const score = Object.keys(columns).length;
    const hasName = columns.first_name !== undefined || columns.full_name !== undefined;
    if (hasName && score > best.score) best = { index, columns, score };
  });

  return best.index >= 0 ? best : null;
}

// Texte d'un CSV : UTF-8, ou Windows-1252 pour les CSV enregistrés par un Excel français
function decodeText(buffer) {
  try {
    const text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    // Retire la marque d'ordre des octets (BOM) ajoutée par certains logiciels
    return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
}

export async function readWorkbook(file) {
  const XLSX = await loadXlsx();
  const data = await file.arrayBuffer();

  // CSV : on garde les valeurs telles quelles (sinon "12-04-2012" serait lu au format américain)
  if (/\.(csv|txt)$/i.test(file.name || "")) {
    return XLSX.read(decodeText(data), { type: "string", raw: true });
  }

  return XLSX.read(data, { type: "array", cellDates: false });
}

/**
 * Convertit une feuille en lignes d'élèves vérifiées.
 * classrooms : classes de l'établissement ; defaultClassroomId : classe
 * utilisée quand la colonne "Classe" est absente ou vide.
 */
export async function extractStudents(workbook, sheetName, { classrooms = [], defaultClassroomId = "" } = {}) {
  const XLSX = await loadXlsx();
  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: "", blankrows: true });

  const header = detectHeader(matrix);
  if (!header) {
    return {
      rows: [],
      error: "Aucune ligne d'en-tête reconnue. Le tableau doit contenir au moins une colonne « Nom » (ou « Noms et prénoms ») et les autres colonnes du modèle.",
    };
  }

  const { columns } = header;
  const missingColumns = [];
  if (columns.matricule === undefined) missingColumns.push("Matricule");
  if (columns.first_name === undefined && columns.full_name === undefined) missingColumns.push("Nom");
  if (columns.last_name === undefined && columns.full_name === undefined) missingColumns.push("Prénom");
  if (columns.gender === undefined) missingColumns.push("Sexe");
  if (columns.birth_date === undefined) missingColumns.push("Date de naissance");
  if (columns.birth_place === undefined) missingColumns.push("Lieu de naissance");

  const classroomIndex = new Map();
  classrooms.forEach((c) => {
    classroomIndex.set(normalizeClassroom(c.name), c);
    if (c.short_name) classroomIndex.set(normalizeClassroom(c.short_name), c);
  });
  const defaultClassroom = classrooms.find((c) => String(c.id) === String(defaultClassroomId));

  const splitNames = columns.full_name !== undefined && (columns.first_name === undefined || columns.last_name === undefined);
  const today = new Date().toISOString().slice(0, 10);
  const seen = new Map();
  const rows = [];

  const dataRows = matrix.slice(header.index + 1);
  if (dataRows.filter((cells) => cells.some((cell) => cellText(cell) !== "")).length > MAX_ROWS) {
    return { rows: [], error: `Le fichier contient plus de ${MAX_ROWS} élèves : découpez-le en plusieurs fichiers (par exemple un par classe).` };
  }

  dataRows.forEach((cells, offset) => {
    if (cells.every((cell) => cellText(cell) === "")) return;

    const line = header.index + offset + 2; // numéro de ligne affiché par Excel
    const get = (field) => (columns[field] === undefined ? "" : cells[columns[field]]);
    const errors = [];

    let firstName = cellText(get("first_name"));
    let lastName = cellText(get("last_name"));
    if (splitNames) {
      ({ first_name: firstName, last_name: lastName } = splitFullName(cellText(get("full_name"))));
    }

    const matricule = cellText(get("matricule"));
    const rawGender = cellText(get("gender"));
    const gender = parseGender(rawGender);
    const rawBirthDate = get("birth_date");
    const birthDate = parseBirthDate(rawBirthDate, XLSX.SSF);
    const birthPlace = cellText(get("birth_place"));
    const contact = cellText(get("contact"));
    const classroomText = cellText(get("classroom"));
    const classroom = classroomText ? classroomIndex.get(normalizeClassroom(classroomText)) : defaultClassroom;

    if (!matricule) errors.push("Matricule manquant.");
    if (!firstName) errors.push("Nom manquant.");
    if (!lastName) errors.push("Prénom manquant.");
    if (!gender) errors.push(rawGender ? `Sexe « ${rawGender} » non reconnu (M ou F).` : "Sexe manquant.");
    if (!birthDate) errors.push(cellText(rawBirthDate) ? `Date de naissance « ${cellText(rawBirthDate)} » non reconnue.` : "Date de naissance manquante.");
    else if (birthDate >= today) errors.push("La date de naissance doit être antérieure à aujourd'hui.");
    if (!birthPlace) errors.push("Lieu de naissance manquant.");
    if (contact.length > 50) errors.push("Contact trop long (50 caractères maximum).");
    if (!classroom) {
      errors.push(classroomText ? `Classe « ${classroomText} » introuvable dans votre établissement.` : "Aucune classe : choisissez une classe par défaut ou remplissez la colonne « Classe ».");
    }

    const key = matricule.toLowerCase();
    if (matricule && seen.has(key)) errors.push(`Matricule déjà présent à la ligne ${seen.get(key)}.`);
    else if (matricule) seen.set(key, line);

    rows.push({
      line,
      matricule,
      first_name: firstName,
      last_name: lastName,
      gender,
      birth_date: birthDate,
      birth_place: birthPlace,
      contact,
      classroom_id: classroom?.id ?? null,
      classroom_name: classroom?.name ?? classroomText,
      errors,
    });
  });

  return { rows, missingColumns, splitNames, hasClassroomColumn: columns.classroom !== undefined };
}

/**
 * Modèle Excel à remplir : feuille "Élèves" (en-têtes) et feuille
 * "Instructions" avec la liste des classes de l'établissement.
 */
export async function downloadTemplate(classrooms = []) {
  const XLSX = await loadXlsx();
  const workbook = XLSX.utils.book_new();

  const students = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS]);
  students["!cols"] = [14, 22, 22, 8, 18, 20, 18, 22].map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, students, "Élèves");

  const instructions = XLSX.utils.aoa_to_sheet([
    ["Import des élèves — EduNote"],
    [],
    ["Remplissez une ligne par élève dans la feuille « Élèves », sans modifier la ligne d'en-tête."],
    ["Colonnes obligatoires : Matricule, Nom, Prénom, Sexe, Date de naissance, Lieu de naissance."],
    ["Sexe : M ou F (Masculin / Féminin, Garçon / Fille sont aussi acceptés)."],
    ["Date de naissance : JJ/MM/AAAA, par exemple 15/03/2012."],
    ["Classe : facultative. Si elle est vide, la classe choisie au moment de l'import est utilisée."],
    ["Un élève déjà inscrit dans l'établissement les années précédentes (même matricule) est réinscrit automatiquement."],
    [],
    ["Classes de votre établissement (à recopier dans la colonne « Classe ») :"],
    ...classrooms.map((c) => [c.name]),
  ]);
  instructions["!cols"] = [{ wch: 110 }];
  XLSX.utils.book_append_sheet(workbook, instructions, "Instructions");

  XLSX.writeFile(workbook, "modele_import_eleves.xlsx");
}
