import en from "./en";
import pt from "./pt";

const dictionaries = { en, pt };

export function createT(lang) {
  const dict = dictionaries[lang] || en;
  const fallback = en;

  return function t(path) {
    const keys = path.split(".");
    let value = dict;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }
    if (value !== undefined) return value;

    // Fallback to English
    let fb = fallback;
    for (const k of keys) {
      fb = fb?.[k];
      if (fb === undefined) break;
    }
    return fb;
  };
}
