export interface CountryOption {
  code: string;
  name: string;
}

/** Optional parenthetical short forms — only USA, UK, UAE per product preference. */
const COUNTRY_SHORT_LABEL: Partial<Record<string, string>> = {
  "United States": "USA",
  "United Kingdom": "UK",
  "United Arab Emirates": "UAE",
};

/** Extra lowercase tokens that match a country when searching (synonyms / typing shortcuts). */
const COUNTRY_SEARCH_EXTRA: Partial<Record<string, readonly string[]>> = {
  US: ["usa", "america", "u.s.", "u.s.a."],
  GB: ["uk", "britain", "great britain", "england", "scotland", "wales"],
  AE: ["uae"],
  KR: ["korea", "south korea", "rok"],
  CZ: ["czech", "czech republic"],
};

/**
 * Display label in lists and chips. Only USA, UK, UAE use a short form in parentheses;
 * all other countries use the standard English name only.
 */
export function formatCountryOptionLabel(country: CountryOption): string {
  const short = COUNTRY_SHORT_LABEL[country.name];
  if (short) {
    return `${country.name} (${short})`;
  }
  return country.name;
}

function normalizeSearchToken(s: string): string {
  return s.trim().toLowerCase();
}

/**
 * Matches country name, formatted label, ISO code, standard short labels, and optional synonyms.
 */
export function countryMatchesSearchQuery(country: CountryOption, queryRaw: string): boolean {
  const q = normalizeSearchToken(queryRaw);
  if (!q) {
    return true;
  }

  const name = country.name.toLowerCase();
  const label = formatCountryOptionLabel(country).toLowerCase();
  const code = country.code.toLowerCase();
  const short = COUNTRY_SHORT_LABEL[country.name]?.toLowerCase();

  if (name.includes(q) || label.includes(q) || code.includes(q)) {
    return true;
  }
  if (short !== undefined && short.includes(q)) {
    return true;
  }

  const extras = COUNTRY_SEARCH_EXTRA[country.code];
  if (extras && q.length >= 2) {
    for (const term of extras) {
      if (term.includes(q)) {
        return true;
      }
    }
  }

  return false;
}

let cache: CountryOption[] | null = null;
type IntlWithLocale = typeof Intl & {
  Locale?: new (locale: string) => { region?: string };
};

export function getCountryNameFromLocale(
  locale: string | undefined,
  countries: CountryOption[],
): string | null {
  if (!locale) {
    return null;
  }

  let regionCode: string | null = null;
  try {
    const intlWithLocale = Intl as IntlWithLocale;
    if (typeof Intl !== "undefined" && typeof intlWithLocale.Locale === "function") {
      const localeParser = new intlWithLocale.Locale(locale);
      regionCode = localeParser.region ?? null;
    }
  } catch {
    // ignore and fallback to regex parsing
  }

  if (!regionCode) {
    const match = locale.match(/-([A-Za-z]{2})\b/);
    regionCode = match?.[1]?.toUpperCase() ?? null;
  }

  if (!regionCode) {
    return null;
  }

  const found = countries.find((country) => country.code === regionCode);
  return found?.name ?? null;
}

function buildCountriesFromDisplayNames(display: Intl.DisplayNames): CountryOption[] {
  const countriesByName = new Map<string, CountryOption>();

  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first, second);
      const name = display.of(code);
      if (!name || name === code || name.toLowerCase().includes("unknown region")) {
        continue;
      }
      const key = name.toLowerCase();
      if (!countriesByName.has(key)) {
        countriesByName.set(key, { code, name });
      }
    }
  }

  return Array.from(countriesByName.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/**
 * Countries currently in `selectedLocationNames` appear first (same order as in the preset),
 * then remaining entries sorted A–Z. `"remote"` and `"fully-remote"` are ignored; they are not country rows.
 */
export function sortCountriesSelectedFirst(
  filteredCountries: CountryOption[],
  selectedLocationNames: readonly string[],
): CountryOption[] {
  const selectedCodes = new Set<string>();
  const orderedSelected: CountryOption[] = [];

  for (const loc of selectedLocationNames) {
    if (loc === "remote" || loc === "fully-remote") {
      continue;
    }
    const country = filteredCountries.find((c) => c.name === loc);
    if (country && !selectedCodes.has(country.code)) {
      selectedCodes.add(country.code);
      orderedSelected.push(country);
    }
  }

  const rest = filteredCountries
    .filter((c) => !selectedCodes.has(c.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...orderedSelected, ...rest];
}

export function getAllCountryOptions(): CountryOption[] {
  if (cache) {
    return cache;
  }

  if (typeof Intl !== "undefined" && typeof Intl.DisplayNames === "function") {
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    try {
      const countries = buildCountriesFromDisplayNames(display);
      cache = countries;
      return countries;
    } catch {
      // fall back below
    }
  }

  cache = [];
  return [];
}

