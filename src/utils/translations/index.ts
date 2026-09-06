import { LanguageCode, LanguageOption, SUPPORTED_LANGUAGES } from './types';
import { en } from './en';
import { hi } from './hi';
import { bn } from './bn';
import { mr } from './mr';
import { pa } from './pa';
import { te } from './te';
import { ta } from './ta';
import { gu } from './gu';
import { kn } from './kn';

export * from './types';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  bn,
  mr,
  pa,
  te,
  ta,
  gu,
  kn,
};

export const getTranslation = (lang: LanguageCode, key: string, fallback?: string): string => {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || fallback || key;
};
