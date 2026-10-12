import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Info, Loader2, RefreshCw, Upload, UserCheck, UserPlus, X } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { Table, TdBody, Th, Tr } from "../Table";
import {
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE,
  downloadTemplate,
  extractStudents,
  readWorkbook,
} from "../../utils/studentImport";

// L'API accepte 1000 lignes par envoi : les gros fichiers partent en plusieurs fois
const CHUNK_SIZE = 500;

const formatDate = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

/**
 * Inscription d'élèves en masse depuis un fichier Excel (directeur).
 * Étapes : choix du fichier -> aperçu vérifié -> rapport d'import.
 */
export default function StudentImportModal({ open, onClose, onImported }) {
  const fileInputRef = useRef(null);
  const [step, setStep] = useState("choose"); // choose | preview | done
  const [classrooms, setClassrooms] = useState([]);
  const [defaultClassroomId, setDefaultClassroomId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [workbook, setWorkbook] = useState(null);
  const [sheetName, setSheetName] = useState("");
  const [parsed, setParsed] = useState(null);
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  // Chargement des classes de l'établissement (l'API ne renvoie que celles de l'école du directeur),
  // gardé en promesse pour que le modèle téléchargé attende la liste des classes
  const classroomsRequest = useRef(null);

  useEffect(() => {
    if (!open) return;
    classroomsRequest.current = api.get("/classrooms")
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : data.data || [];
        setClassrooms(list);
        return list;
      })
      .catch((error) => {
        toast.error(error.message);
        return [];
      });
  }, [open]);

  // Nouvelle analyse quand la feuille ou la classe par défaut change
  useEffect(() => {
    if (!workbook || !sheetName) return;
    let ignore = false;
    extractStudents(workbook, sheetName, { classrooms, defaultClassroomId })
      .then((data) => { if (!ignore) setParsed(data); });
    return () => { ignore = true; };
  }, [workbook, sheetName, classrooms, defaultClassroomId]);

  const validRows = useMemo(() => (parsed?.rows || []).filter((row) => row.errors.length === 0), [parsed]);
  const invalidCount = (parsed?.rows?.length || 0) - validRows.length;
  const displayedRows = useMemo(
    () => (parsed?.rows || []).filter((row) => !onlyErrors || row.errors.length > 0),
    [parsed, onlyErrors]
  );

  if (!open) return null;

  const reset = () => {
    setStep("choose");
    setWorkbook(null);
    setSheetName("");
    setParsed(null);
    setFileName("");
    setOnlyErrors(false);
    setResult(null);
  };

  const close = () => {
    if (importing) return;
    reset();
    onClose();
  };

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Fichier trop volumineux (5 Mo maximum).");
      return;
    }

    setReading(true);
    try {
      const book = await readWorkbook(file);
      // Première feuille contenant des données
      const firstSheet = book.SheetNames.find((name) => book.Sheets[name]?.["!ref"]) || book.SheetNames[0];
      setFileName(file.name);
      setWorkbook(book);
      setSheetName(firstSheet);
      setStep("preview");
    } catch {
      toast.error("Impossible de lire ce fichier. Vérifiez qu'il s'agit bien d'un fichier Excel (.xlsx, .xls), .ods ou .csv.");
    } finally {
      setReading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);

    const total = { created: 0, re_enrolled: 0, already_enrolled: 0, errors: [], skipped: invalidCount };
    try {
      for (let start = 0; start < validRows.length; start += CHUNK_SIZE) {
        const chunk = validRows.slice(start, start + CHUNK_SIZE).map((row) => ({
          line: row.line,
          matricule: row.matricule,
          first_name: row.first_name,
          last_name: row.last_name,
          gender: row.gender,
          birth_date: row.birth_date,
          birth_place: row.birth_place,
          contact: row.contact || null,
          classroom_id: row.classroom_id,
        }));

        const { data } = await api.post("/director-space/students/import", { students: chunk });
        total.created += data.created;
        total.re_enrolled += data.re_enrolled;
        total.already_enrolled += data.already_enrolled;
        total.errors.push(...data.errors);
      }

      setResult(total);
      setStep("done");
      if (total.created + total.re_enrolled > 0) onImported?.();
    } catch (error) {
      // Les lots déjà envoyés sont enregistrés : un nouvel import du même fichier est sans risque
      if (total.created + total.re_enrolled > 0) {
        setResult({ ...total, interrupted: error.message });
        setStep("done");
        onImported?.();
      } else {
        toast.error(error.message);
      }
    } finally {
      setImporting(false);
    }
  };

  const handleTemplate = async () => {
    try {
      await downloadTemplate((await classroomsRequest.current) || classrooms);
    } catch {
      toast.error("Impossible de générer le modèle.");
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/40 p-0 sm:p-4">
      <div className="flex h-full w-full flex-col overflow-hidden bg-base-200 sm:h-auto sm:max-h-[90vh] sm:max-w-5xl sm:rounded-md">

        {/* En-tête */}
        <div className="flex items-center justify-between gap-4 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-base-content">Importer des élèves depuis Excel</h2>
              <p className="text-xs text-base-content/50">
                {step === "preview" ? fileName : "Inscrivez toute une liste d'élèves en une seule fois"}
              </p>
            </div>
          </div>
          <button onClick={close} disabled={importing} className="rounded-md p-2 transition-colors duration-150 hover:bg-base-300 disabled:opacity-50">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">

          {/* Étape 1 : choix du fichier */}
          {step === "choose" && (
            <>
              <div className="flex flex-col gap-4 rounded-md bg-primary/10 p-4 text-sm text-base-content/70 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Info size={16} className="mt-0.5 shrink-0 text-primary" />
                  <p className="leading-relaxed">
                    Le fichier doit contenir une ligne d'en-tête avec les colonnes <strong>Matricule, Nom, Prénom, Sexe,
                    Date de naissance, Lieu de naissance</strong> (obligatoires), et éventuellement <strong>Contact parent</strong> et
                    <strong> Classe</strong>. L'ordre des colonnes n'a pas d'importance.
                  </p>
                </div>
                <button
                  onClick={handleTemplate}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-base-200 px-4 py-2.5 text-sm font-medium text-primary transition-colors duration-150 hover:bg-base-300"
                >
                  <Download size={16} /> Télécharger le modèle
                </button>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-base-content/60">
                  Classe par défaut (utilisée si la colonne « Classe » est absente ou vide)
                </label>
                <select
                  value={defaultClassroomId}
                  onChange={(e) => setDefaultClassroomId(e.target.value)}
                  className="w-full rounded-md bg-base-100 px-4 py-3 text-sm outline-none"
                >
                  <option value="">Aucune — la classe est indiquée dans le fichier</option>
                  {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-md px-6 py-12 text-center transition-colors duration-150 ${
                  dragging ? "bg-primary/10" : "bg-base-100 hover:bg-base-300"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_EXTENSIONS}
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                {reading ? (
                  <Loader2 size={32} className="animate-spin text-primary" />
                ) : (
                  <Upload size={32} className={dragging ? "text-primary" : "text-base-content/30"} />
                )}
                <p className="mt-3 text-sm font-medium text-base-content">
                  {reading ? "Lecture du fichier..." : "Glissez votre fichier ici ou cliquez pour le choisir"}
                </p>
                <p className="mt-1 text-xs text-base-content/50">Excel (.xlsx, .xls), OpenDocument (.ods) ou CSV — 5 Mo maximum</p>
              </label>
            </>
          )}

          {step === "preview" && !parsed && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-base-content/60">
              <Loader2 size={18} className="animate-spin text-primary" /> Analyse du fichier...
            </div>
          )}

          {/* Étape 2 : aperçu vérifié */}
          {step === "preview" && parsed && (
            <>
              {parsed.error ? (
                <div className="flex items-start gap-3 rounded-md bg-error/10 p-4 text-sm text-base-content/80">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
                  <p>{parsed.error}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-sm bg-base-300 px-2.5 py-1 text-xs font-medium text-base-content/70">
                      {parsed.rows.length} ligne(s)
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-sm bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                      <CheckCircle2 size={13} /> {validRows.length} prête(s)
                    </span>
                    {invalidCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-error/10 px-2.5 py-1 text-xs font-medium text-error">
                        <AlertCircle size={13} /> {invalidCount} à corriger
                      </span>
                    )}

                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      {workbook.SheetNames.length > 1 && (
                        <select
                          value={sheetName}
                          onChange={(e) => setSheetName(e.target.value)}
                          className="rounded-md bg-base-100 px-3 py-2 text-xs outline-none"
                          title="Feuille du classeur"
                        >
                          {workbook.SheetNames.map((name) => <option key={name} value={name}>Feuille : {name}</option>)}
                        </select>
                      )}
                      {!parsed.hasClassroomColumn && (
                        <select
                          value={defaultClassroomId}
                          onChange={(e) => setDefaultClassroomId(e.target.value)}
                          className="rounded-md bg-base-100 px-3 py-2 text-xs outline-none"
                          title="Classe des élèves du fichier"
                        >
                          <option value="">Choisir la classe...</option>
                          {classrooms.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      )}
                      {invalidCount > 0 && (
                        <button
                          onClick={() => setOnlyErrors((value) => !value)}
                          className="rounded-md bg-base-100 px-3 py-2 text-xs font-medium text-base-content/70 transition-colors duration-150 hover:bg-base-300"
                        >
                          {onlyErrors ? "Afficher toutes les lignes" : "Afficher les lignes à corriger"}
                        </button>
                      )}
                    </div>
                  </div>

                  {parsed.missingColumns?.length > 0 && (
                    <div className="flex items-start gap-3 rounded-md bg-error/10 p-4 text-sm text-base-content/80">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-error" />
                      <p>Colonne(s) introuvable(s) dans le fichier : <strong>{parsed.missingColumns.join(", ")}</strong>. Vérifiez la ligne d'en-tête ou utilisez le modèle.</p>
                    </div>
                  )}

                  {parsed.splitNames && (
                    <div className="flex items-start gap-3 rounded-md bg-warning/10 p-4 text-sm text-base-content/80">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning" />
                      <p>
                        Le nom et le prénom ont été déduits de la colonne « Noms et prénoms » (les mots en MAJUSCULES forment le nom).
                        Vérifiez l'aperçu avant d'importer.
                      </p>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-md bg-base-100">
                    <Table>
                      <Table.Head>
                        <Th>Ligne</Th>
                        <Th>Matricule</Th>
                        <Th>Nom</Th>
                        <Th>Prénom</Th>
                        <Th>Sexe</Th>
                        <Th>Né(e) le</Th>
                        <Th>Lieu</Th>
                        <Th>Contact</Th>
                        <Th>Classe</Th>
                        <Th>Statut</Th>
                      </Table.Head>
                      <Table.Body>
                        {displayedRows.map((row) => (
                          <Fragment key={row.line}>
                            <Tr>
                              <TdBody className="text-base-content/50">{row.line}</TdBody>
                              <TdBody><span className="font-mono text-xs">{row.matricule}</span></TdBody>
                              <TdBody className="font-medium">{row.first_name}</TdBody>
                              <TdBody>{row.last_name}</TdBody>
                              <TdBody>{row.gender}</TdBody>
                              <TdBody>{formatDate(row.birth_date)}</TdBody>
                              <TdBody>{row.birth_place}</TdBody>
                              <TdBody>{row.contact}</TdBody>
                              <TdBody>{row.classroom_name}</TdBody>
                              <TdBody>
                                {row.errors.length === 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-sm bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                                    <CheckCircle2 size={12} /> Prête
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-sm bg-error/10 px-2 py-0.5 text-xs font-medium text-error">
                                    <AlertCircle size={12} /> À corriger
                                  </span>
                                )}
                              </TdBody>
                            </Tr>
                            {/* Détail des erreurs sur toute la largeur, sous la ligne concernée */}
                            {row.errors.length > 0 && (
                              <tr className="bg-error/5">
                                <td colSpan={10} className="px-4 pb-3 pt-1 text-xs text-error">
                                  Ligne {row.line} : {row.errors.join(" ")}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>

                  {invalidCount > 0 && validRows.length > 0 && (
                    <p className="text-xs text-base-content/50">
                      Les lignes à corriger seront ignorées. Vous pourrez réimporter le fichier corrigé : les élèves déjà inscrits ne seront pas dupliqués.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {/* Étape 3 : rapport */}
          {step === "done" && result && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-success/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-success"><UserPlus size={14} /> Nouveaux élèves</div>
                  <div className="mt-1 text-2xl font-semibold text-success">{result.created}</div>
                </div>
                <div className="rounded-md bg-primary/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary"><RefreshCw size={14} /> Réinscriptions</div>
                  <div className="mt-1 text-2xl font-semibold text-primary">{result.re_enrolled}</div>
                </div>
                <div className="rounded-md bg-base-100 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-base-content/60"><UserCheck size={14} /> Déjà inscrits cette année</div>
                  <div className="mt-1 text-2xl font-semibold text-base-content">{result.already_enrolled}</div>
                </div>
              </div>

              {result.skipped > 0 && (
                <div className="flex items-start gap-3 rounded-md bg-warning/10 p-4 text-sm text-base-content/80">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning" />
                  <p>
                    {result.skipped} ligne(s) à corriger n'ont pas été importées. Corrigez-les dans le fichier puis
                    réimportez-le : les élèves déjà inscrits ne seront pas dupliqués.
                  </p>
                </div>
              )}

              {result.interrupted && (
                <div className="flex items-start gap-3 rounded-md bg-warning/10 p-4 text-sm text-base-content/80">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-warning" />
                  <p>Import interrompu ({result.interrupted}). Les élèves listés ci-dessus sont enregistrés ; réimportez le fichier pour terminer.</p>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="rounded-md bg-error/10 p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-error">
                    <AlertCircle size={16} /> {result.errors.length} ligne(s) refusée(s) par le serveur
                  </h3>
                  <ul className="space-y-1 text-sm text-base-content/80">
                    {result.errors.map((error) => (
                      <li key={error.line}><strong>Ligne {error.line} :</strong> {error.messages.join(" ")}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 p-6 pt-0 sm:flex-row sm:justify-end">
          {step === "choose" && (
            <button onClick={close} className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300">
              Annuler
            </button>
          )}

          {step === "preview" && (
            <>
              <button
                onClick={reset}
                disabled={importing}
                className="rounded-md bg-base-100 px-5 py-2.5 text-sm font-medium text-base-content transition-colors duration-150 hover:bg-base-300 disabled:opacity-50"
              >
                Changer de fichier
              </button>
              <button
                onClick={handleImport}
                disabled={importing || validRows.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-content transition-colors duration-150 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {importing ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                {importing ? "Import en cours..." : `Importer ${validRows.length} élève(s)`}
              </button>
            </>
          )}

          {step === "done" && (
            <button onClick={close} className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-content transition-colors duration-150 hover:brightness-95">
              Terminer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
