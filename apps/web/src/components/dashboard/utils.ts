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

export const getSlovakPluralChicks = (count: number) => {
  if (count === 1) return "1 kuriatko";
  if (count >= 2 && count <= 4) return `${count} kuriatka`;
  return `${count} kuriatok`;
};

export const getSlovakPluralDucks = (count: number) => {
  if (count === 1) return "1 kačka";
  if (count >= 2 && count <= 4) return `${count} kačky`;
  return `${count} kačiek`;
};

export const formatChicksAge = (hatchedDateStr: string) => {
  try {
    const [year, month, day] = hatchedDateStr.split("-").map(Number);
    const hatched = new Date(year, month - 1, day);
    const now = new Date();
    hatched.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = Math.max(0, now.getTime() - hatched.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      if (diffDays === 1) return "1 deň";
      if (diffDays >= 2 && diffDays <= 4) return `${diffDays} dni`;
      return `${diffDays} dní`;
    }

    const diffWeeks = Math.floor(diffDays / 7);
    if (diffDays < 30) {
      if (diffWeeks === 1) return "1 týždeň";
      if (diffWeeks >= 2 && diffWeeks <= 4) return `${diffWeeks} týždne`;
      return `${diffWeeks} týždňov`;
    }

    const diffMonths = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    const remainingWeeks = Math.floor(remainingDays / 7);

    let monthsStr = "";
    if (diffMonths === 1) monthsStr = "1 mesiac";
    else if (diffMonths >= 2 && diffMonths <= 4) monthsStr = `${diffMonths} mesiace`;
    else monthsStr = `${diffMonths} mesiacov`;

    if (remainingWeeks > 0) {
      let weeksStr = "";
      if (remainingWeeks === 1) weeksStr = "1 týždeň";
      else if (remainingWeeks >= 2 && remainingWeeks <= 4) weeksStr = `${remainingWeeks} týždne`;
      return `${monthsStr} a ${weeksStr}`;
    }

    return monthsStr;
  } catch (e) {
    return "";
  }
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

export const getExpectedLayingDate = (hatchedDateStr: string) => {
  try {
    const [year, month, day] = hatchedDateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + 140); // 20 weeks / 5 months
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  } catch (e) {
    return "";
  }
};
