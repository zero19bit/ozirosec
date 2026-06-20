import { describe, expect, it } from 'vitest';
import { labs } from '../../data/labs';
import { vulnerabilities } from '../../data/vulnerabilities';
import { vulnerabilityArticles } from './articles';
import { validateVulnerabilityArticles } from './validation';
import type { BilingualVulnerabilityArticle } from './types';

const batchOneIds = ['sqli', 'xss', 'csrf', 'cors', 'clickjacking', 'path-traversal'];
const batchTwoIds = ['ssrf', 'xxe', 'rce', 'idor', 'jwt', 'nosqli', 'ssti', 'file-upload'];
const batchThreeIds = [
  'http-smuggling',
  'deserialization',
  'graphql',
  'oauth',
  'race-conditions',
  'business-logic',
  'web-cache-poisoning',
];
const forbiddenSecretPattern = /flag\{|hp_flag|sk_live|Bearer\s+[A-Za-z0-9._-]+|'\s*OR\s*1=1--/i;
const unfinishedContentPattern = /\b(TODO|TBD)\b|placeholder article/i;

function cloneArticles(): BilingualVulnerabilityArticle[] {
  return structuredClone(vulnerabilityArticles);
}

describe('vulnerability bilingual content validation', () => {
  it('keeps a complete structural inventory for every current vulnerability', () => {
    const result = validateVulnerabilityArticles(vulnerabilityArticles);

    expect(vulnerabilityArticles).toHaveLength(vulnerabilities.length);
    expect(result.structuralIssues).toEqual([]);
    expect(result.isStructurallyValid).toBe(true);
  });

  it('tracks the full article set as complete after all planned batches are populated', () => {
    const result = validateVulnerabilityArticles(vulnerabilityArticles, { requireCompleteContent: true });

    expect(result.isStructurallyValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.completionIssues).toEqual([]);
  });

  it('contains and completes every Batch 1 English and Persian article', () => {
    const batchOneArticles = vulnerabilityArticles.filter((article) => article.batch === 1);
    const result = validateVulnerabilityArticles(vulnerabilityArticles, { requireCompleteContent: true });
    const batchOneCompletionIssues = result.completionIssues.filter((issue) => batchOneIds.includes(issue.articleId));

    expect(batchOneArticles.map((article) => article.id).sort()).toEqual([...batchOneIds].sort());
    expect(batchOneCompletionIssues).toEqual([]);

    for (const article of batchOneArticles) {
      expect(article.status.english).toBe('complete');
      expect(article.status.persian).toBe('complete');
      expect(article.status.references).toBe('complete');
      expect(article.status.tests).toBe('complete');
      expect(article.status.finalReview).toBe('complete');
      expect(article.locales.en.title.trim()).not.toBe('');
      expect(article.locales.fa.title.trim()).not.toBe('');
    }
  });

  it('keeps Batch 1 references, related vulnerabilities, and lab links valid', () => {
    const batchOneArticles = vulnerabilityArticles.filter((article) => article.batch === 1);
    const result = validateVulnerabilityArticles(vulnerabilityArticles);

    expect(result.structuralIssues.filter((issue) => batchOneIds.includes(issue.articleId))).toEqual([]);

    for (const article of batchOneArticles) {
      expect(article.references.length).toBeGreaterThanOrEqual(3);
      expect(article.relatedLabIds.length).toBeGreaterThan(0);
      expect(article.relatedVulnerabilityIds.length).toBeGreaterThan(0);
      expect(article.references.every((reference) => reference.url.startsWith('https://'))).toBe(true);
    }
  });

  it('keeps Batch 1 content free of active flags, bearer tokens, and exact lab-solution patterns', () => {
    const batchOneContent = JSON.stringify(vulnerabilityArticles.filter((article) => article.batch === 1));

    expect(batchOneContent).not.toMatch(forbiddenSecretPattern);
  });

  it('contains and completes every Batch 2 English and Persian article', () => {
    const batchTwoArticles = vulnerabilityArticles.filter((article) => article.batch === 2);
    const result = validateVulnerabilityArticles(vulnerabilityArticles, { requireCompleteContent: true });
    const batchTwoCompletionIssues = result.completionIssues.filter((issue) => batchTwoIds.includes(issue.articleId));

    expect(batchTwoArticles.map((article) => article.id).sort()).toEqual([...batchTwoIds].sort());
    expect(batchTwoCompletionIssues).toEqual([]);

    for (const article of batchTwoArticles) {
      expect(article.status.english).toBe('complete');
      expect(article.status.persian).toBe('complete');
      expect(article.status.references).toBe('complete');
      expect(article.status.tests).toBe('complete');
      expect(article.status.finalReview).toBe('complete');
      expect(article.locales.en.overviewSections.map((section) => section.id)).toEqual(
        article.locales.fa.overviewSections.map((section) => section.id),
      );
    }
  });

  it('keeps Batch 2 references, related vulnerabilities, and lab links valid', () => {
    const batchTwoArticles = vulnerabilityArticles.filter((article) => article.batch === 2);
    const result = validateVulnerabilityArticles(vulnerabilityArticles);

    expect(result.structuralIssues.filter((issue) => batchTwoIds.includes(issue.articleId))).toEqual([]);

    for (const article of batchTwoArticles) {
      expect(article.references.length).toBeGreaterThanOrEqual(3);
      expect(article.relatedLabIds.length).toBeGreaterThan(0);
      expect(article.relatedVulnerabilityIds.length).toBeGreaterThan(0);
      expect(article.references.every((reference) => reference.url.startsWith('https://'))).toBe(true);
    }
  });

  it('keeps Batch 2 content free of unfinished markers, raw HTML, flags, secrets, and exact lab solutions', () => {
    const batchTwoContent = JSON.stringify(vulnerabilityArticles.filter((article) => article.batch === 2));

    expect(batchTwoContent).not.toMatch(forbiddenSecretPattern);
    expect(batchTwoContent).not.toMatch(unfinishedContentPattern);
    expect(batchTwoContent).not.toMatch(/dangerouslySetInnerHTML|<script/i);
  });

  it('contains and completes every Batch 3 English and Persian article', () => {
    const batchThreeArticles = vulnerabilityArticles.filter((article) => article.batch === 3);
    const result = validateVulnerabilityArticles(vulnerabilityArticles, { requireCompleteContent: true });
    const batchThreeCompletionIssues = result.completionIssues.filter((issue) => batchThreeIds.includes(issue.articleId));

    expect(batchThreeArticles.map((article) => article.id).sort()).toEqual([...batchThreeIds].sort());
    expect(batchThreeCompletionIssues).toEqual([]);

    for (const article of batchThreeArticles) {
      expect(article.status.english).toBe('complete');
      expect(article.status.persian).toBe('complete');
      expect(article.status.references).toBe('complete');
      expect(article.status.tests).toBe('complete');
      expect(article.status.finalReview).toBe('complete');
      expect(article.locales.en.overviewSections.map((section) => section.id)).toEqual(
        article.locales.fa.overviewSections.map((section) => section.id),
      );
      expect(article.locales.en.httpExamples).toHaveLength(article.locales.fa.httpExamples.length);
      expect(article.locales.en.codeExamples).toHaveLength(article.locales.fa.codeExamples.length);
    }
  });

  it('keeps Batch 3 references, related vulnerabilities, and lab links valid', () => {
    const batchThreeArticles = vulnerabilityArticles.filter((article) => article.batch === 3);
    const result = validateVulnerabilityArticles(vulnerabilityArticles);

    expect(result.structuralIssues.filter((issue) => batchThreeIds.includes(issue.articleId))).toEqual([]);

    for (const article of batchThreeArticles) {
      expect(article.references.length).toBeGreaterThanOrEqual(3);
      expect(article.relatedLabIds.length).toBeGreaterThan(0);
      expect(article.relatedVulnerabilityIds.length).toBeGreaterThan(0);
      expect(article.references.every((reference) => reference.url.startsWith('https://'))).toBe(true);
    }
  });

  it('keeps Batch 3 content free of unfinished markers, raw HTML, flags, secrets, and exact lab solutions', () => {
    const batchThreeContent = JSON.stringify(vulnerabilityArticles.filter((article) => article.batch === 3));

    expect(batchThreeContent).not.toMatch(forbiddenSecretPattern);
    expect(batchThreeContent).not.toMatch(unfinishedContentPattern);
    expect(batchThreeContent).not.toMatch(/dangerouslySetInnerHTML|<script/i);
  });

  it('detects duplicate vulnerability IDs and slugs', () => {
    const articles = cloneArticles();
    articles[1] = { ...articles[1], id: articles[0].id, slug: articles[0].slug };

    const result = validateVulnerabilityArticles(articles);

    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('duplicate-id');
    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('duplicate-slug');
  });

  it('detects missing localized titles and descriptions', () => {
    const articles = cloneArticles();
    articles[0].locales.en.title = '';
    articles[0].locales.fa.summary = '   ';

    const result = validateVulnerabilityArticles(articles);

    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('missing-title');
    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('missing-description');
  });

  it('detects missing required section arrays without throwing type errors', () => {
    const articles = cloneArticles();
    const malformedContent = {
      ...articles[0].locales.en,
      overviewSections: undefined,
      detection: undefined,
    } as unknown as BilingualVulnerabilityArticle['locales']['en'];

    articles[0].locales.en = malformedContent;

    const result = validateVulnerabilityArticles(articles);

    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('missing-section');
  });

  it('detects broken and missing lab relationships', () => {
    const articles = cloneArticles();
    const articleWithLabs = articles.find((article) => labs.some((lab) => lab.categoryId === article.id));

    expect(articleWithLabs).toBeDefined();

    if (!articleWithLabs) {
      return;
    }

    articleWithLabs.relatedLabIds = ['unknown-lab'];

    const result = validateVulnerabilityArticles(articles);
    const rules = result.structuralIssues.map((issue) => issue.rule);

    expect(rules).toContain('broken-related-lab');
    expect(rules).toContain('missing-lab-relationship');
  });

  it('detects invalid non-HTTPS references', () => {
    const articles = cloneArticles();
    articles[0].references = [{ title: 'Unsafe reference', url: 'http://example.test/reference' }];

    const result = validateVulnerabilityArticles(articles);

    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('invalid-reference-url');
  });

  it('detects English and Persian structure mismatches', () => {
    const articles = cloneArticles();
    articles[0].locales.en.impact.push('English impact placeholder');

    const result = validateVulnerabilityArticles(articles);

    expect(result.structuralIssues.map((issue) => issue.rule)).toContain('locale-structure-mismatch');
  });

  it('detects incomplete final statuses during complete validation', () => {
    const articles = cloneArticles();
    articles[0].status.finalReview = 'reviewed';

    const result = validateVulnerabilityArticles(articles, { requireCompleteContent: true });

    expect(result.completionIssues.map((issue) => issue.rule)).toContain('incomplete-status');
  });

  it('detects placeholder and secret-like article content', () => {
    const articles = cloneArticles();
    articles[0].locales.en.summary = 'TODO replace placeholder article';
    articles[1].locales.en.summary = 'Use hp_flag training token';

    const result = validateVulnerabilityArticles(articles);
    const unsafeIssues = result.structuralIssues.filter((issue) => issue.rule === 'unsafe-content');

    expect(unsafeIssues).toHaveLength(2);
  });
});

