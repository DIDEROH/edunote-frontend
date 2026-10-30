import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import { ClipboardPen, CornerDownLeft, GraduationCap, School, Search, UserRound, Users, WifiOff } from "lucide-react";
import { api } from "../../utils/AxiosClient";
import { useAuth } from "../../context/AuthContext";
import { popIn } from "../motion/variants";
import { iconFor } from "./navIcons";

// Recherche sans accents ni majuscules (« eleves » trouve « Élèves »)
const normalize = (text = "") => String(text).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const matches = (query, ...fields) => fields.some((field) => normalize(field).includes(query));

const MIN_SERVER_QUERY = 2;
const LIMIT = 6;

/**
 * Recherche globale (Ctrl + K) : pages du menu, et selon le profil
 * - direction / modérateurs : élèves (côté serveur), classes, personnel ;
 * - enseignant : ses classes et matières (ouvre la saisie des notes) ;
 * - équipe EduNote : établissements (côté serveur).
 * Flèches pour choisir, Entrée pour ouvrir, Échap pour fermer.
 */
export default function CommandPalette({ open, onClose, pages }) {
  const navigate = useNavigate();
  const { user, school, hasRole, can } = useAuth();
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [sources, setSources] = useState({ classes: [], members: [], assignments: [] });
  const [remote, setRemote] = useState({ query: null, students: [], schools: [], failed: false });
  const listRef = useRef(null);

  const manager = (hasRole("director") || hasRole("moderator")) && school?.status === "active";
  const teacher = hasRole("teacher");
  const admin = hasRole("admin");
  const q = normalize(query.trim());

  // Listes chargées une fois à l'ouverture, filtrées sur l'appareil
  useEffect(() => {
    if (!open) return undefined;
    let ignore = false;
    if (manager && school?.id) {
      api.get(`/schools/${school.id}`, { offlineCache: false })
        .then(({ data }) => { if (!ignore) setSources((s) => ({ ...s, classes: data.classrooms || [] })); })
        .catch(() => {});
      api.get("/school/members", { offlineCache: false })
        .then(({ data }) => { if (!ignore) setSources((s) => ({ ...s, members: data.members || [] })); })
        .catch(() => {});
    }
    if (teacher && user?.id) {
      api.get(`/teachers/${user.id}/assignments`)
        .then(({ data }) => { if (!ignore) setSources((s) => ({ ...s, assignments: data.data || [] })); })
        .catch(() => {});
    }
    return () => { ignore = true; };
  }, [open, manager, teacher, school?.id, user?.id]);

  // Élèves et établissements : recherche côté serveur, après une courte pause de frappe
  useEffect(() => {
    if (!open || q.length < MIN_SERVER_QUERY || (!manager && !admin)) return undefined;
    let ignore = false;
    const term = query.trim();
    const timer = setTimeout(() => {
      Promise.allSettled([
        manager ? api.post("/student_enrollments", { search: term }, { offlineCache: false }) : null,
        admin ? api.get("/schools", { params: { search: term }, offlineCache: false }) : null,
      ]).then(([students, schools]) => {
        if (ignore) return;
        setRemote({
          query: q,
          students: students.value?.data?.data ?? [],
          schools: Array.isArray(schools.value?.data) ? schools.value.data : [],
          failed: students.status === "rejected" || schools.status === "rejected",
        });
      });
    }, 280);
    return () => { ignore = true; clearTimeout(timer); };
  }, [open, q, query, manager, admin]);

  const searching = (manager || admin) && q.length >= MIN_SERVER_QUERY && remote.query !== q;
  const remoteReady = remote.query === q;

  // Résultats regroupés par rubrique ; la liste aplatie sert à la navigation au clavier
  const sections = (() => {
    const result = [];
    const pageItems = [...pages, { name: "Mon profil", to: "/profile", icon: null }]
      .filter((page) => !q || matches(q, page.name))
      .map((page) => ({ key: `page-${page.to}`, to: page.to, title: page.name, icon: page.icon ? iconFor(page.icon) : UserRound }));
    if (pageItems.length) result.push({ title: "Pages", items: pageItems });

    if (!q) return result;

    if (remoteReady && remote.students.length) {
      result.push({
        title: "Élèves",
        items: remote.students.slice(0, LIMIT).map((student) => {
          const enrollment = [...(student.enrollments || [])]
            .filter((e) => !school?.id || e.school_id === school.id)
            .sort((a, b) => (b.academic_year_id ?? 0) - (a.academic_year_id ?? 0))[0];
          return {
            key: `student-${student.id}`,
            to: `/students/${student.id}`,
            title: `${student.last_name} ${student.first_name}`,
            subtitle: [student.matricule, enrollment?.classroom?.name].filter(Boolean).join(" · "),
            icon: GraduationCap,
          };
        }),
      });
    }

    const classes = sources.classes.filter((c) => matches(q, c.name, c.short_name)).slice(0, LIMIT);
    if (manager && classes.length) {
      result.push({
        title: "Classes",
        items: classes.map((c) => ({
          key: `class-${c.id}`,
          to: can("classes") ? `/my-classes/${c.id}` : "/my-classes",
          title: c.name,
          subtitle: `${(c.subjects || []).length} matière(s)`,
          icon: Users,
        })),
      });
    }

    const members = sources.members
      .filter((member) => member.user && matches(q, member.user.first_name, member.user.last_name,
        `${member.user.last_name} ${member.user.first_name}`, member.user.phone, member.user.email))
      .slice(0, LIMIT);
    if (manager && members.length) {
      result.push({
        title: "Personnel",
        items: members.map((member) => ({
          key: `member-${member.user.id}`,
          to: "/staff",
          title: `${member.user.last_name ?? ""} ${member.user.first_name ?? ""}`.trim(),
          subtitle: [member.roles?.includes("director") ? "Chef d'établissement" : member.roles?.includes("moderator") ? "Modérateur" : "Enseignant", member.user.phone].filter(Boolean).join(" · "),
          icon: UserRound,
        })),
      });
    }

    const assignments = sources.assignments
      .filter((a) => matches(q, a.classroom?.name, a.subject?.name, a.school?.name))
      .slice(0, LIMIT);
    if (teacher && assignments.length) {
      result.push({
        title: "Mes classes",
        items: assignments.map((a) => ({
          key: `assignment-${a.id}`,
          to: `/marks/entry?assignmentId=${a.id}`,
          title: `${a.classroom?.name ?? ""} — ${a.subject?.name ?? ""}`,
          subtitle: `Saisir les notes · ${a.school?.name ?? ""}`,
          icon: ClipboardPen,
        })),
      });
    }

    if (remoteReady && remote.schools.length) {
      result.push({
        title: "Établissements",
        items: remote.schools.slice(0, LIMIT).map((s) => ({
          key: `school-${s.id}`,
          to: `/schools/${s.id}`,
          title: s.name,
          subtitle: [s.city, s.code, s.status_label].filter(Boolean).join(" · "),
          icon: School,
        })),
      });
    }

    return result;
  })();

  const items = sections.flatMap((section) => section.items);
  // Position de la première ligne de chaque rubrique dans la liste aplatie
  const starts = sections.reduce((acc, section, i) => [...acc, i === 0 ? 0 : acc[i - 1] + sections[i - 1].items.length], []);
  const selectedIndex = Math.max(0, Math.min(index, items.length - 1));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const close = () => {
    onClose();
    setQuery("");
    setIndex(0);
  };

  const go = (item) => {
    if (!item) return;
    close();
    navigate(item.to);
  };

  const onKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIndex(Math.min(selectedIndex + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setIndex(Math.max(selectedIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(items[selectedIndex]);
    } else if (event.key === "Escape") {
      close();
    }
  };

  const placeholder = manager
    ? "Rechercher une page, un élève, une classe, un membre…"
    : admin
      ? "Rechercher une page ou un établissement…"
      : teacher
        ? "Rechercher une page ou une de vos classes…"
        : "Aller à une page…";

  return (
    <AnimatePresence>
      {open && (
        <m.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-night/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => event.target === event.currentTarget && close()}
          role="dialog"
          aria-modal="true"
          aria-label="Recherche"
        >
          <m.div variants={popIn} initial="hidden" animate="show" exit="exit" className="surface w-full max-w-xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-base-300 px-4 py-3.5">
              <Search size={18} className="shrink-0 text-base-content/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => { setQuery(e.target.value); setIndex(0); }}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                aria-label="Rechercher"
                className="w-full bg-transparent text-[15px] outline-none placeholder:text-base-content/40"
              />
              {searching && <span className="ui-spinner shrink-0 text-primary" aria-label="Recherche en cours" />}
              <kbd className="shrink-0 rounded-md bg-base-100 px-1.5 py-0.5 text-[10px] font-semibold text-base-content/50 ring-1 ring-base-300">Échap</kbd>
            </div>

            <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2">
              {sections.map((section, sectionIndex) => (
                <div key={section.title} className="pb-1">
                  <p className="eyebrow px-3 pt-2 pb-1.5 text-base-content/40">{section.title}</p>
                  <ul>
                    {section.items.map((item, itemIndex) => {
                      const i = starts[sectionIndex] + itemIndex;
                      const selected = i === selectedIndex;
                      const Icon = item.icon;
                      return (
                        <li key={item.key}>
                          <button
                            type="button"
                            data-index={i}
                            onMouseEnter={() => setIndex(i)}
                            onClick={() => go(item)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${selected ? "bg-primary/8 text-primary" : "text-base-content/80"}`}
                          >
                            <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${selected ? "bg-primary text-white" : "bg-base-100 text-base-content/60"}`}>
                              <Icon size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{item.title}</span>
                              {item.subtitle && <span className="block truncate text-xs text-base-content/50">{item.subtitle}</span>}
                            </span>
                            {selected && <CornerDownLeft size={14} className="shrink-0 text-primary/70" />}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {q && remoteReady && remote.failed && (
                <p className="flex items-center gap-2 px-3 py-2 text-xs text-warning">
                  <WifiOff size={13} /> Recherche des élèves et établissements indisponible (hors ligne ?).
                </p>
              )}
              {q && items.length === 0 && !searching && (
                <p className="px-3 py-8 text-center text-sm text-base-content/50">Aucun résultat pour « {query.trim()} ».</p>
              )}
              {q && q.length < MIN_SERVER_QUERY && (manager || admin) && (
                <p className="px-3 pt-1 pb-2 text-xs text-base-content/40">Tapez au moins 2 lettres pour chercher {manager ? "un élève" : "un établissement"}.</p>
              )}
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
