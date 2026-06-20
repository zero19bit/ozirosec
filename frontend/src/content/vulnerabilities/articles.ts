import { labs } from '../../data/labs';
import { vulnerabilities } from '../../data/vulnerabilities';
import { faLabel } from '../../utils/localizeContent';
import { batch1Articles } from './batch1Articles';
import { batch2Articles } from './batch2Articles';
import { batch3Articles } from './batch3Articles';
import { sqlInjectionArticle } from './sqlInjectionArticle';
import type {
  BilingualVulnerabilityArticle,
  LocalizedVulnerabilityArticle,
  VulnerabilityArticleStatus,
  VulnerabilityContentBatch,
} from './types';

const draftStatus: VulnerabilityArticleStatus = {
  english: 'not-started',
  persian: 'not-started',
  references: 'not-started',
  tests: 'not-started',
  finalReview: 'not-started',
};

const persianTitlesById: Record<string, string> = {
  sqli: 'تزریق SQL',
  xss: 'اسکریپت‌نویسی میان‌سایتی (XSS)',
  csrf: 'جعل درخواست میان‌سایتی (CSRF)',
  ssrf: 'جعل درخواست سمت سرور (SSRF)',
  xxe: 'موجودیت خارجی XML (XXE)',
  rce: 'اجرای کد از راه دور (RCE)',
  'path-traversal': 'پیمایش مسیر',
  idor: 'ارجاع مستقیم ناامن به شیء (IDOR)',
  jwt: 'آسیب‌پذیری‌های JWT',
  cors: 'پیکربندی نادرست CORS',
  ssti: 'تزریق قالب سمت سرور (SSTI)',
  clickjacking: 'کلیک‌ربایی',
  nosqli: 'تزریق NoSQL',
  'http-smuggling': 'قاچاق درخواست HTTP',
  'file-upload': 'آسیب‌پذیری‌های بارگذاری فایل',
  deserialization: 'سریال‌زدایی ناامن',
  graphql: 'آسیب‌پذیری‌های GraphQL',
  oauth: 'آسیب‌پذیری‌های OAuth',
  'race-conditions': 'شرایط رقابتی',
  'business-logic': 'نقص‌های منطق کسب‌وکار',
  'web-cache-poisoning': 'مسموم‌سازی کش وب',
};

const batchById: Record<string, VulnerabilityContentBatch> = {
  sqli: 1,
  xss: 1,
  csrf: 1,
  cors: 1,
  clickjacking: 1,
  'path-traversal': 1,
  ssrf: 2,
  xxe: 2,
  rce: 2,
  idor: 2,
  jwt: 2,
  nosqli: 2,
  ssti: 2,
  'file-upload': 2,
  'http-smuggling': 3,
  deserialization: 3,
  graphql: 3,
  oauth: 3,
  'race-conditions': 3,
  'business-logic': 3,
  'web-cache-poisoning': 3,
};

function relatedLabIdsFor(categoryId: string): string[] {
  return labs.filter((lab) => lab.categoryId === categoryId).map((lab) => lab.id);
}

function createDraftArticleContent(title: string, summary: string): LocalizedVulnerabilityArticle {
  return {
    title,
    summary,
    callouts: [],
    overviewSections: [],
    httpExamples: [],
    impact: [],
    businessImpact: [],
    remediation: [],
    safePayloadExamples: [],
    attackScenarios: [],
    commonMistakes: [],
    detection: {
      manual: [],
      automated: [],
    },
    codeExamples: [],
    developerChecklist: [],
    testerChecklist: [],
    misconceptions: [],
    reviewQuestions: [],
  };
}

export const vulnerabilityArticles: BilingualVulnerabilityArticle[] = vulnerabilities.map((vulnerability) => {
  if (vulnerability.id === sqlInjectionArticle.id) {
    return sqlInjectionArticle;
  }

  const completedBatchOneArticle = batch1Articles.find((article) => article.id === vulnerability.id);

  if (completedBatchOneArticle) {
    return completedBatchOneArticle;
  }

  const completedBatchTwoArticle = batch2Articles.find((article) => article.id === vulnerability.id);

  if (completedBatchTwoArticle) {
    return completedBatchTwoArticle;
  }

  const completedBatchThreeArticle = batch3Articles.find((article) => article.id === vulnerability.id);

  if (completedBatchThreeArticle) {
    return completedBatchThreeArticle;
  }

  return {
    id: vulnerability.id,
    slug: vulnerability.slug,
    batch: batchById[vulnerability.id] ?? 3,
    severity: vulnerability.severity,
    currentContentSource: 'frontend/src/data/vulnerabilities.ts',
    relatedLabIds: relatedLabIdsFor(vulnerability.id),
    relatedVulnerabilityIds: [],
    mappings: {
      owasp: [],
      cwe: [],
    },
    references: vulnerability.references.map((reference) => ({
      title: reference.title,
      url: reference.url,
    })),
    status: { ...draftStatus },
    locales: {
      en: createDraftArticleContent(vulnerability.title, vulnerability.description),
      fa: createDraftArticleContent(
        persianTitlesById[vulnerability.id] ?? faLabel(vulnerability.title),
        faLabel(vulnerability.description),
      ),
    },
  };
});

