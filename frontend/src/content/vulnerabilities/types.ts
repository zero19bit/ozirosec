import type { Vulnerability } from '../../data/vulnerabilities';

export type VulnerabilityContentStatus = 'not-started' | 'drafted' | 'reviewed' | 'complete';

export type VulnerabilityContentBatch = 1 | 2 | 3;

export type VulnerabilityContentSource = 'frontend/src/data/vulnerabilities.ts';

export interface VulnerabilityArticleStatus {
  english: VulnerabilityContentStatus;
  persian: VulnerabilityContentStatus;
  references: VulnerabilityContentStatus;
  tests: VulnerabilityContentStatus;
  finalReview: VulnerabilityContentStatus;
}

export interface VulnerabilityArticleSection {
  id: string;
  title: string;
  body: string[];
}

export interface VulnerabilityArticleCallout {
  type: 'warning' | 'info' | 'success';
  title: string;
  body: string;
}

export interface VulnerabilityHttpExample {
  id: string;
  title: string;
  description: string;
  request: string;
  response: string;
}

export interface VulnerabilityCodeExample {
  language: string;
  title: string;
  vulnerable: string;
  fixed: string;
}

export interface VulnerabilityDetectionGuidance {
  manual: string[];
  automated: string[];
}

export interface VulnerabilityExternalReference {
  title: string;
  url: string;
}

export interface VulnerabilityMisconception {
  myth: string;
  correction: string;
}

export interface VulnerabilitySecurityMapping {
  owasp: string[];
  cwe: string[];
  portSwigger?: string;
}

export interface LocalizedVulnerabilityArticle {
  title: string;
  summary: string;
  callouts: VulnerabilityArticleCallout[];
  overviewSections: VulnerabilityArticleSection[];
  httpExamples: VulnerabilityHttpExample[];
  impact: string[];
  businessImpact: string[];
  remediation: string[];
  safePayloadExamples: string[];
  attackScenarios: string[];
  commonMistakes: string[];
  detection: VulnerabilityDetectionGuidance;
  codeExamples: VulnerabilityCodeExample[];
  developerChecklist: string[];
  testerChecklist: string[];
  misconceptions: VulnerabilityMisconception[];
  reviewQuestions: string[];
}

export interface BilingualVulnerabilityArticle {
  id: Vulnerability['id'];
  slug: Vulnerability['slug'];
  batch: VulnerabilityContentBatch;
  severity: Vulnerability['severity'];
  currentContentSource: VulnerabilityContentSource;
  relatedLabIds: string[];
  relatedVulnerabilityIds: string[];
  mappings: VulnerabilitySecurityMapping;
  references: VulnerabilityExternalReference[];
  status: VulnerabilityArticleStatus;
  locales: {
    en: LocalizedVulnerabilityArticle;
    fa: LocalizedVulnerabilityArticle;
  };
}

export interface VulnerabilityContentValidationIssue {
  articleId: string;
  rule:
    | 'duplicate-id'
    | 'duplicate-slug'
    | 'missing-locale'
    | 'missing-section'
    | 'empty-required-array'
    | 'broken-related-lab'
    | 'invalid-reference-url'
    | 'missing-title'
    | 'missing-description'
    | 'missing-lab-relationship'
    | 'locale-structure-mismatch'
    | 'incomplete-status'
    | 'unsafe-content';
  message: string;
}

export interface VulnerabilityContentValidationOptions {
  requireCompleteContent?: boolean;
}

export interface VulnerabilityContentValidationResult {
  structuralIssues: VulnerabilityContentValidationIssue[];
  completionIssues: VulnerabilityContentValidationIssue[];
  isStructurallyValid: boolean;
  isComplete: boolean;
}

