import { labs } from '../../data/labs';
import type {
  BilingualVulnerabilityArticle,
  LocalizedVulnerabilityArticle,
  VulnerabilityContentValidationIssue,
  VulnerabilityContentValidationOptions,
  VulnerabilityContentValidationResult,
} from './types';

type LocalizedArrayKey =
  | 'callouts'
  | 'overviewSections'
  | 'httpExamples'
  | 'impact'
  | 'businessImpact'
  | 'remediation'
  | 'safePayloadExamples'
  | 'attackScenarios'
  | 'commonMistakes'
  | 'codeExamples'
  | 'developerChecklist'
  | 'testerChecklist'
  | 'misconceptions'
  | 'reviewQuestions';

const localizedArrayKeys: LocalizedArrayKey[] = [
  'callouts',
  'overviewSections',
  'httpExamples',
  'impact',
  'businessImpact',
  'remediation',
  'safePayloadExamples',
  'attackScenarios',
  'commonMistakes',
  'codeExamples',
  'developerChecklist',
  'testerChecklist',
  'misconceptions',
  'reviewQuestions',
];

const knownLabIds = new Set(labs.map((lab) => lab.id));
const unfinishedContentPattern = /\b(TODO|TBD)\b|lorem ipsum|placeholder article/i;
const secretLikePattern = /flag\{|hp_flag|sk_live|Bearer\s+[A-Za-z0-9._-]+|HACKPATH_FLAG_SECRET|APP_KEY=|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|'\s*OR\s*1=1--/i;
const unsafeHtmlPattern = /dangerouslySetInnerHTML|<script/i;

function addIssue(
  issues: VulnerabilityContentValidationIssue[],
  articleId: string,
  rule: VulnerabilityContentValidationIssue['rule'],
  message: string,
): void {
  issues.push({ articleId, rule, message });
}

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateLocalizedContent(
  articleId: string,
  locale: 'en' | 'fa',
  content: LocalizedVulnerabilityArticle | undefined,
  structuralIssues: VulnerabilityContentValidationIssue[],
  completionIssues: VulnerabilityContentValidationIssue[],
  requireCompleteContent: boolean,
): void {
  if (!content) {
    addIssue(structuralIssues, articleId, 'missing-locale', `Missing ${locale} article content.`);
    return;
  }

  if (!content.title.trim()) {
    addIssue(structuralIssues, articleId, 'missing-title', `Missing ${locale} title.`);
  }

  if (!content.summary.trim()) {
    addIssue(structuralIssues, articleId, 'missing-description', `Missing ${locale} summary.`);
  }

  for (const key of localizedArrayKeys) {
    if (!Array.isArray(content[key])) {
      addIssue(structuralIssues, articleId, 'missing-section', `Missing ${locale}.${key} array.`);
    } else if (requireCompleteContent && content[key].length === 0) {
      addIssue(completionIssues, articleId, 'empty-required-array', `${locale}.${key} is empty.`);
    }
  }

  if (!content.detection || !Array.isArray(content.detection.manual)) {
    addIssue(structuralIssues, articleId, 'missing-section', `Missing ${locale}.detection.manual array.`);
  } else if (requireCompleteContent && content.detection.manual.length === 0) {
    addIssue(completionIssues, articleId, 'empty-required-array', `${locale}.detection.manual is empty.`);
  }

  if (!content.detection || !Array.isArray(content.detection.automated)) {
    addIssue(structuralIssues, articleId, 'missing-section', `Missing ${locale}.detection.automated array.`);
  } else if (requireCompleteContent && content.detection.automated.length === 0) {
    addIssue(completionIssues, articleId, 'empty-required-array', `${locale}.detection.automated is empty.`);
  }
}

function validateLocaleStructure(
  article: BilingualVulnerabilityArticle,
  structuralIssues: VulnerabilityContentValidationIssue[],
): void {
  for (const key of localizedArrayKeys) {
    if (!Array.isArray(article.locales.en[key]) || !Array.isArray(article.locales.fa[key])) {
      continue;
    }

    if (article.locales.en[key].length !== article.locales.fa[key].length) {
      addIssue(
        structuralIssues,
        article.id,
        'locale-structure-mismatch',
        `English and Persian ${key} arrays have different lengths.`,
      );
    }
  }

  if (
    Array.isArray(article.locales.en.detection?.manual)
    && Array.isArray(article.locales.fa.detection?.manual)
    && article.locales.en.detection.manual.length !== article.locales.fa.detection.manual.length
  ) {
    addIssue(
      structuralIssues,
      article.id,
      'locale-structure-mismatch',
      'English and Persian manual detection arrays have different lengths.',
    );
  }

  if (
    Array.isArray(article.locales.en.detection?.automated)
    && Array.isArray(article.locales.fa.detection?.automated)
    && article.locales.en.detection.automated.length !== article.locales.fa.detection.automated.length
  ) {
    addIssue(
      structuralIssues,
      article.id,
      'locale-structure-mismatch',
      'English and Persian automated detection arrays have different lengths.',
    );
  }
}

function expectedRelatedLabIds(articleId: string): string[] {
  return labs.filter((lab) => lab.categoryId === articleId).map((lab) => lab.id);
}

function validateCompleteStatus(
  article: BilingualVulnerabilityArticle,
  completionIssues: VulnerabilityContentValidationIssue[],
): void {
  const expectedStatuses: Array<keyof BilingualVulnerabilityArticle['status']> = [
    'english',
    'persian',
    'references',
    'tests',
    'finalReview',
  ];

  for (const statusKey of expectedStatuses) {
    if (article.status[statusKey] !== 'complete') {
      addIssue(
        completionIssues,
        article.id,
        'incomplete-status',
        `${statusKey} status must be complete for final content validation.`,
      );
    }
  }
}

function validateSafeContent(
  article: BilingualVulnerabilityArticle,
  structuralIssues: VulnerabilityContentValidationIssue[],
): void {
  const serializedArticle = JSON.stringify(article);

  if (unfinishedContentPattern.test(serializedArticle)) {
    addIssue(structuralIssues, article.id, 'unsafe-content', 'Article contains unfinished placeholder text.');
  }

  if (secretLikePattern.test(serializedArticle)) {
    addIssue(structuralIssues, article.id, 'unsafe-content', 'Article contains a secret-like or exact-solution pattern.');
  }

  if (unsafeHtmlPattern.test(serializedArticle)) {
    addIssue(structuralIssues, article.id, 'unsafe-content', 'Article contains unsafe raw HTML or executable script pattern.');
  }
}

export function validateVulnerabilityArticles(
  articles: BilingualVulnerabilityArticle[],
  options: VulnerabilityContentValidationOptions = {},
): VulnerabilityContentValidationResult {
  const structuralIssues: VulnerabilityContentValidationIssue[] = [];
  const completionIssues: VulnerabilityContentValidationIssue[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const knownArticleIds = new Set(articles.map((article) => article.id));
  const requireCompleteContent = options.requireCompleteContent ?? false;

  for (const article of articles) {
    if (ids.has(article.id)) {
      addIssue(structuralIssues, article.id, 'duplicate-id', `Duplicate vulnerability ID: ${article.id}.`);
    }
    ids.add(article.id);

    if (slugs.has(article.slug)) {
      addIssue(structuralIssues, article.id, 'duplicate-slug', `Duplicate vulnerability slug: ${article.slug}.`);
    }
    slugs.add(article.slug);

    validateLocalizedContent(
      article.id,
      'en',
      article.locales.en,
      structuralIssues,
      completionIssues,
      requireCompleteContent,
    );
    validateLocalizedContent(
      article.id,
      'fa',
      article.locales.fa,
      structuralIssues,
      completionIssues,
      requireCompleteContent,
    );
    validateLocaleStructure(article, structuralIssues);
    validateSafeContent(article, structuralIssues);

    if (requireCompleteContent) {
      validateCompleteStatus(article, completionIssues);
    }

    const expectedLabs = expectedRelatedLabIds(article.id);
    if (expectedLabs.length > 0) {
      const configuredLabs = new Set(article.relatedLabIds);
      const missingLabs = expectedLabs.filter((labId) => !configuredLabs.has(labId));

      if (missingLabs.length > 0) {
        addIssue(
          structuralIssues,
          article.id,
          'missing-lab-relationship',
          `Missing related lab IDs: ${missingLabs.join(', ')}.`,
        );
      }
    }

    for (const labId of article.relatedLabIds) {
      if (!knownLabIds.has(labId)) {
        addIssue(structuralIssues, article.id, 'broken-related-lab', `Unknown related lab ID: ${labId}.`);
      }
    }

    for (const relatedVulnerabilityId of article.relatedVulnerabilityIds) {
      if (!knownArticleIds.has(relatedVulnerabilityId)) {
        addIssue(
          structuralIssues,
          article.id,
          'broken-related-lab',
          `Unknown related vulnerability ID: ${relatedVulnerabilityId}.`,
        );
      }
    }

    for (const reference of article.references) {
      if (!reference.title.trim()) {
        addIssue(structuralIssues, article.id, 'missing-title', 'Reference title is missing.');
      }

      if (!isValidHttpsUrl(reference.url)) {
        addIssue(structuralIssues, article.id, 'invalid-reference-url', `Reference URL must be valid HTTPS: ${reference.url}.`);
      }
    }
  }

  return {
    structuralIssues,
    completionIssues,
    isStructurallyValid: structuralIssues.length === 0,
    isComplete: structuralIssues.length === 0 && completionIssues.length === 0,
  };
}

