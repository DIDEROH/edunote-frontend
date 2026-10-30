import {
  Award, BookMarked, CalendarArrowUp, CalendarRange, ChartSpline, ClipboardCheck, ClipboardPen, FileText,
  GraduationCap, History, LayoutDashboard, Presentation, School, Settings, UserRound, Users,
} from "lucide-react";

/** Icône de chaque entrée du menu (constants/pages.js → `icon`) */
export const NAV_ICONS = {
  Dashboard: LayoutDashboard,
  Students: GraduationCap,
  ReportCard: FileText,
  Teachers: Presentation,
  Terms: CalendarRange,
  Schools: School,
  Classrooms: Users,
  Subjects: BookMarked,
  Others: Settings,
  Personnel: UserRound,
  MarkEntry: ClipboardPen,
  HubMark: ChartSpline,
  Skills: Award,
  YearTransition: CalendarArrowUp,
  History,
  Progress: ClipboardCheck,
};

export const iconFor = (name) => NAV_ICONS[name] ?? LayoutDashboard;

/** Entrée du menu active pour l'adresse courante (la plus précise) */
export function activePage(pages, pathname) {
  return pages
    .filter((page) => pathname === page.to || (page.to !== "/" && pathname.startsWith(`${page.to}/`)))
    .sort((a, b) => b.to.length - a.to.length)[0];
}
