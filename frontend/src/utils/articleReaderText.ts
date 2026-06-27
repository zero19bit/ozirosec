import type { LocalizedVulnerabilityArticle } from '../content/vulnerabilities';
import type { Translation } from '../lib/writeupApi';

export type WriteupReaderSectionKey =
  | 'technical_overview'
  | 'attack_explanation'
  | 'root_cause'
  | 'impact'
  | 'mitigation'
  | 'developer_lessons'
  | 'conclusion';

export type WriteupReaderSectionLabels = Record<WriteupReaderSectionKey, string>;

const writeupSectionKeys: WriteupReaderSectionKey[] = [
  'technical_overview',
  'attack_explanation',
  'root_cause',
  'impact',
  'mitigation',
  'developer_lessons',
  'conclusion',
];

const securityTerms = new Set([
  'api',
  'csrf',
  'csp',
  'cve',
  'cwe',
  'get',
  'graphql',
  'http',
  'https',
  'idor',
  'jwt',
  'oauth',
  'owasp',
  'post',
  'put',
  'patch',
  'delete',
  'rce',
  'sql',
  'ssrf',
  'xss',
  'xxe',
]);

function compact(parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => normalizeSpeechText(part ?? ''))
    .filter(Boolean)
    .join('\n\n');
}

export function normalizeSpeechText(value: string): string {
  return value
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function removeFencedCodeBlocks(value: string): string {
  const lines = value.replace(/\r\n?/g, '\n').split('\n');
  const kept: string[] = [];
  let inFence = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }

    if (!inFence) {
      kept.push(line);
    }
  }

  return kept.join('\n');
}

function removeHtmlTags(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|section|article|header|h[1-6]|li|blockquote|tr)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
}

function looksLikeUrl(value: string): boolean {
  return /^(https?:\/\/|www\.)/i.test(value);
}

function looksLikeFilePath(value: string): boolean {
  return /(^|[\s"'`])([a-z]:\\|\.{1,2}\/|\/[a-z0-9_.-]+\/|~\/)/i.test(value);
}

function looksLikeHashOrEncodedPayload(value: string): boolean {
  const compacted = value.replace(/\s+/g, '');
  return /^[a-f0-9]{32,}$/i.test(compacted)
    || (compacted.length > 32 && /^[a-z0-9+/=_-]+$/i.test(compacted));
}

function looksLikeCommandOrCode(value: string): boolean {
  return /[;&|<>$\\{}[\]=]/.test(value)
    || /\b(sudo|curl|wget|nmap|cat|grep|awk|sed|chmod|rm|python|node|npm|php|bash|sh|powershell)\b/i.test(value)
    || /\b(alert|eval|script|onerror|cookie|console\.log)\b/i.test(value)
    || /\b(document|window)\./i.test(value)
    || /\b(select|union|drop|insert|update|delete)\b.+\b(from|where|table|users)\b/i.test(value);
}

function isMeaningfulInlineCode(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || trimmed.length > 36) {
    return false;
  }

  if (looksLikeUrl(trimmed) || looksLikeFilePath(trimmed) || looksLikeHashOrEncodedPayload(trimmed) || looksLikeCommandOrCode(trimmed)) {
    return false;
  }

  if (/^(CVE|CWE)-\d{2,5}-\d{1,8}$/i.test(trimmed)) {
    return true;
  }

  if (/^port\s+\d{1,5}$/i.test(trimmed) || /^\d{2,5}$/.test(trimmed)) {
    return true;
  }

  const normalized = trimmed.toLowerCase();

  if (securityTerms.has(normalized) || normalized === 'burp suite') {
    return true;
  }

  return /^[\p{L}\p{N}][\p{L}\p{N} .+-]{0,34}$/u.test(trimmed);
}

function replaceInlineCode(value: string): string {
  return value.replace(/`([^`\n]+)`/g, (_match, code: string) =>
    isMeaningfulInlineCode(code) ? code.trim() : ' ',
  );
}

function convertMarkdownTables(value: string): string {
  return value
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();

      if (!trimmed.includes('|')) {
        return line;
      }

      if (/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed)) {
        return '';
      }

      const cells = trimmed
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((cell) => cell.trim())
        .filter((cell) => cell && !/^:?-{3,}:?$/.test(cell));

      if (cells.length < 2) {
        return line;
      }

      return cells.join('. ');
    })
    .join('\n');
}

function removeMarkdownSyntax(value: string): string {
  return value
    .replace(/!\[[^\]\n]*\]\([^)\n]*\)/g, ' ')
    .replace(/\[([^\]\n]+)\]\([^)\n]*\)/g, '$1')
    .replace(/^(#{1,6})\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^[\s>*+-]*\[[ xX]\]\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, '')
    .replace(/[*_~]{1,3}/g, '')
    .replace(/(^|\s)#+(\s|$)/g, ' ');
}

function removeRawUrls(value: string): string {
  return value.replace(/\b(?:https?:\/\/|www\.)[^\s<>()]+/gi, ' ');
}

function removeDangerousLooseLines(value: string): string {
  return value
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        return true;
      }

      if (trimmed.length > 260 && /[{}()[\];|<>/=]{3,}/.test(trimmed)) {
        return false;
      }

      return !(looksLikeFilePath(trimmed) || looksLikeHashOrEncodedPayload(trimmed) || looksLikeCommandOrCode(trimmed));
    })
    .join('\n');
}

export function sanitizeArticleSpeechText(content: string): string {
  if (!content.trim()) {
    return '';
  }

  const withoutCodeBlocks = removeFencedCodeBlocks(content);
  const withoutHtml = removeHtmlTags(withoutCodeBlocks);
  const withReadableTables = convertMarkdownTables(withoutHtml);
  const withInlineCodeHandled = replaceInlineCode(withReadableTables);
  const withoutMarkdownSyntax = removeMarkdownSyntax(withInlineCodeHandled);
  const withoutRawUrls = removeRawUrls(withoutMarkdownSyntax);
  const withoutLooseCode = removeDangerousLooseLines(withoutRawUrls);

  return normalizeSpeechText(withoutLooseCode);
}

export function stripMarkdownForSpeech(markdown: string): string {
  return sanitizeArticleSpeechText(markdown);
}

export function buildWriteupReaderText(
  translation: Translation | undefined,
  sectionLabels: WriteupReaderSectionLabels,
  findingsLabel: string,
): string {
  if (!translation) {
    return '';
  }

  const sections = writeupSectionKeys.map((key) => {
    const content = translation[key];

    if (!content) {
      return null;
    }

    return compact([sectionLabels[key], stripMarkdownForSpeech(content)]);
  });

  return compact([
    translation.title,
    stripMarkdownForSpeech(translation.short_summary),
    translation.key_findings && translation.key_findings.length > 0
      ? compact([findingsLabel, ...translation.key_findings])
      : null,
    ...sections,
  ]);
}

export function buildVulnerabilityArticleReaderText(
  content: LocalizedVulnerabilityArticle,
  labels: {
    callouts: string;
    checklists: string;
    misconceptions: string;
  },
): string {
  const callouts = content.callouts.map((callout) =>
    compact([callout.title, callout.body]),
  );

  const overviewSections = content.overviewSections.map((section) =>
    compact([section.title, ...section.body]),
  );

  const checklists = compact([
    labels.checklists,
    ...content.developerChecklist,
    ...content.testerChecklist,
  ]);

  const misconceptions = compact([
    labels.misconceptions,
    ...content.misconceptions.map((item) => compact([item.myth, item.correction])),
  ]);

  return compact([
    content.title,
    content.summary,
    callouts.length > 0 ? compact([labels.callouts, ...callouts]) : null,
    ...overviewSections,
    checklists,
    misconceptions,
  ]);
}
