// Country code helpers.
// `Application.country` is stored as an ISO 3166-1 alpha-2 code (e.g. "DE").
// Country names come from the platform's Intl.DisplayNames (no manual map needed);
// flag emoji is derived from the code's regional-indicator characters.

const ISO_ALPHA2 = /^[A-Za-z]{2}$/;

let regionNames: Intl.DisplayNames | null | undefined;

function getRegionNames(): Intl.DisplayNames | null {
  if (regionNames !== undefined) return regionNames;
  try {
    regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    regionNames = null;
  }
  return regionNames;
}

/** "DE" -> "🇩🇪". Returns "" for anything that isn't a 2-letter code. */
export function getCountryFlag(code: string | null | undefined): string {
  if (!code || !ISO_ALPHA2.test(code)) return "";
  const cc = code.toUpperCase();
  const base = 0x1f1e6; // regional indicator symbol letter A
  return String.fromCodePoint(
    base + cc.charCodeAt(0) - 65,
    base + cc.charCodeAt(1) - 65
  );
}

/** "DE" -> "Germany". Falls back to the upper-cased code if unknown. */
export function getCountryName(code: string | null | undefined): string {
  if (!code) return "";
  const cc = code.toUpperCase();
  if (!ISO_ALPHA2.test(cc)) return cc;
  const names = getRegionNames();
  return names?.of(cc) ?? cc;
}

/** "DE" -> "🇩🇪 Germany". Returns "—" for empty values. */
export function getCountryLabel(code: string | null | undefined): string {
  if (!code) return "—";
  const flag = getCountryFlag(code);
  const name = getCountryName(code);
  return flag ? `${flag} ${name}` : name;
}
