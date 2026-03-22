import { Mode } from "@/types";

export const modes: Mode[] = [
  {
    id: "decidir",
    name: "Decidir",
    subtitle: "Toma decisiones con claridad",
    icon: "\u25C7",
    color: "var(--accent-green)",
    active: true,
  },
  {
    id: "entender",
    name: "Entender",
    subtitle: "Comprende lo que importa",
    icon: "\u25CB",
    color: "var(--accent-blue)",
    active: false,
  },
  {
    id: "resolver",
    name: "Resolver",
    subtitle: "Encuentra la causa real",
    icon: "\u25B3",
    color: "var(--accent-orange)",
    active: false,
  },
  {
    id: "procesar",
    name: "Procesar",
    subtitle: "Da sentido a lo que sientes",
    icon: "\u25A1",
    color: "var(--accent-violet)",
    active: false,
  },
  {
    id: "proyectar",
    name: "Proyectar",
    subtitle: "Diseña tu próximo paso",
    icon: "\u25B7",
    color: "var(--accent-cyan)",
    active: false,
  },
  {
    id: "generar",
    name: "Generar",
    subtitle: "Crea ideas con intención",
    icon: "\u2726",
    color: "var(--accent-pink)",
    active: false,
  },
];
