import { CHICKEN_BREED_PRESETS } from "@/lib/presets";

export const getLearnMoreLink = (name: string, presetId?: string) => {
  if (presetId === "vlaska") return "https://sk.wikipedia.org/wiki/Vla%C5%A1ka_(plemeno_sliepok)";
  if (presetId === "araukana") return "https://sk.wikipedia.org/wiki/Araukana";
  if (presetId === "maranska") return "https://sk.wikipedia.org/wiki/Maranska";
  if (presetId === "hodvabnicka") return "https://sk.wikipedia.org/wiki/Hodv%C3%A1bni%C4%8Dka";
  if (presetId === "kohut") return "https://sk.wikipedia.org/wiki/Kura_dom%C3%A1ca";
  
  return `https://www.google.com/search?q=sliepka+${encodeURIComponent(name.toLowerCase())}`;
};

export const getSlovakPluralHens = (count: number) => {
  if (count === 1) return "1 sliepka";
  if (count >= 2 && count <= 4) return `${count} sliepky`;
  return `${count} sliepok`;
};

export const getSlovakPluralRoosters = (count: number) => {
  if (count === 1) return "1 kohút";
  if (count >= 2 && count <= 4) return `${count} kohúty`;
  return `${count} kohútov`;
};

export const formatDateSlovak = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("sk-SK", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatDateSlovakFull = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("sk-SK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatDateSlovakShort = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("sk-SK", {
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
};

export const formatDateSlovakNumeric = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    return `${day}.${month}.`;
  } catch (e) {
    return dateStr;
  }
};

export const getWeekDayName = (dateStr: string) => {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("sk-SK", { weekday: "long" });
  } catch (e) {
    return "";
  }
};

export const getChickenDetails = (c: any) => {
  const preset = c.presetId ? CHICKEN_BREED_PRESETS.find((p) => p.presetId === c.presetId) : null;
  return {
    name: c.name || preset?.name || "Neznáme plemeno",
    description: c.notes || preset?.description || "Plemeno chované na našej farme.",
    color: c.color || preset?.color || "#2C4E3A",
    imageUrl: c.imageUrl || preset?.imageUrl || "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&w=600&q=80",
  };
};
