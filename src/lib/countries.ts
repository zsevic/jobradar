export interface CountryOption {
  code: string;
  name: string;
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

