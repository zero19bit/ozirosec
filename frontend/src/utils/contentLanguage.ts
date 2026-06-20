export type ContentLocale = 'en' | 'fa';

const persianPattern = /[\u0600-\u06ff]/;

export function detectContentLocale(value: string): ContentLocale {
  return persianPattern.test(value) ? 'fa' : 'en';
}

export function getContentDirection(locale: ContentLocale): 'ltr' | 'rtl' {
  return locale === 'fa' ? 'rtl' : 'ltr';
}

export function getContentTextAlign(locale: ContentLocale): 'text-left' | 'text-right' {
  return locale === 'fa' ? 'text-right' : 'text-left';
}

export function getContentFontClass(locale: ContentLocale): string {
  return locale === 'fa' ? 'font-persian-content' : 'font-latin-content';
}

