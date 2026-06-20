import { cleanup, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '../i18n/LanguageContext';
import i18n from '../i18n/i18n';
import { Vulnerabilities, VulnerabilityDetail } from './Vulnerabilities';

const batchOneSlugs = [
  'sql-injection',
  'cross-site-scripting',
  'csrf',
  'cors',
  'clickjacking',
  'path-traversal',
];

const batchTwoSlugs = [
  'ssrf',
  'xxe',
  'remote-code-execution',
  'idor',
  'jwt-vulnerabilities',
  'nosql-injection',
  'ssti',
  'file-upload-vulnerabilities',
];

const batchThreeSlugs = [
  'http-request-smuggling',
  'deserialization',
  'graphql-vulnerabilities',
  'oauth-vulnerabilities',
  'race-conditions',
  'business-logic-flaws',
  'web-cache-poisoning',
];

function renderVulnerabilityRoute(initialEntry: string) {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/vulnerabilities" element={<Vulnerabilities />} />
          <Route path="/vulnerabilities/:slug" element={<VulnerabilityDetail />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>,
  );
}

describe('vulnerability article pages', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps the vulnerability list rendering with existing card links', () => {
    renderVulnerabilityRoute('/vulnerabilities');

    expect(screen.getByRole('heading', { name: 'Vulnerabilities' })).toBeInTheDocument();
    const sqlInjectionLink = screen
      .getAllByRole('link')
      .find((link) => link.getAttribute('href') === '/vulnerabilities/sql-injection');

    expect(sqlInjectionLink).toBeDefined();
  });

  it('renders the reference English article with LTR article and table of contents', () => {
    renderVulnerabilityRoute('/vulnerabilities/sql-injection');

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'ltr');
    expect(article).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('heading', { name: 'SQL Injection', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Article table of contents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Technical explanation' })).toHaveAttribute('href', '#technical-explanation');
  });

  it.each(batchOneSlugs)('renders Batch 1 English article route %s with internal navigation', (slug) => {
    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('navigation', { name: 'Article table of contents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Technical explanation|Detailed technical explanation/i })).toHaveAttribute('href', '#technical-explanation');
    expect(screen.getByRole('link', { name: /HTTP examples/i })).toHaveAttribute('href', '#http-examples');
  });

  it.each(batchOneSlugs)('renders Batch 1 Persian article route %s with RTL article direction', async (slug) => {
    await i18n.changeLanguage('fa');

    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'rtl');
    expect(article).toHaveAttribute('lang', 'fa');
    expect(screen.getByRole('navigation', { name: 'فهرست مقاله' })).toBeInTheDocument();
  });

  it.each(batchTwoSlugs)('renders Batch 2 English article route %s with navigation and safe links', (slug) => {
    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'ltr');
    expect(screen.getByRole('navigation', { name: 'Article table of contents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Detailed technical explanation/i })).toHaveAttribute('href', '#technical-explanation');
    expect(screen.getAllByRole('button', { name: /Copy/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link').some((link) => link.getAttribute('rel') === 'noopener noreferrer')).toBe(true);
  });

  it.each(batchTwoSlugs)('renders Batch 2 Persian article route %s with RTL article direction and LTR code', async (slug) => {
    await i18n.changeLanguage('fa');

    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'rtl');
    expect(article).toHaveAttribute('lang', 'fa');
    expect(screen.getByRole('navigation', { name: 'فهرست مقاله' })).toBeInTheDocument();
    expect(document.querySelector('[dir="ltr"] code')).toBeInTheDocument();
  });

  it.each(batchThreeSlugs)('renders Batch 3 English article route %s with navigation and safe links', (slug) => {
    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'ltr');
    expect(article).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('navigation', { name: 'Article table of contents' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Detailed technical explanation/i })).toHaveAttribute('href', '#technical-explanation');
    expect(screen.getAllByRole('button', { name: /Copy/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link').some((link) => link.getAttribute('rel') === 'noopener noreferrer')).toBe(true);
  });

  it.each(batchThreeSlugs)('renders Batch 3 Persian article route %s with RTL article direction and LTR code', async (slug) => {
    await i18n.changeLanguage('fa');

    renderVulnerabilityRoute(`/vulnerabilities/${slug}`);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'rtl');
    expect(article).toHaveAttribute('lang', 'fa');
    expect(screen.getByRole('navigation', { name: 'فهرست مقاله' })).toBeInTheDocument();
    expect(document.querySelector('[dir="ltr"] code')).toBeInTheDocument();
  });

  it('renders the reference Persian article with RTL direction while code remains LTR', async () => {
    await i18n.changeLanguage('fa');

    renderVulnerabilityRoute('/vulnerabilities/sql-injection');

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('dir', 'rtl');
    expect(article).toHaveAttribute('lang', 'fa');
    expect(screen.getByRole('heading', { name: 'تزریق SQL', level: 1 })).toBeInTheDocument();

    const codeBlocks = screen.getAllByText(/SELECT id, name, price FROM products/i);
    expect(codeBlocks[0].closest('[dir="ltr"]')).toBeInTheDocument();
  });

  it('supports language switching between English and Persian content', async () => {
    const { rerender } = render(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/vulnerabilities/sql-injection']}>
          <Routes>
            <Route path="/vulnerabilities/:slug" element={<VulnerabilityDetail />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(screen.getByRole('heading', { name: 'SQL Injection', level: 1 })).toBeInTheDocument();

    await i18n.changeLanguage('fa');
    rerender(
      <LanguageProvider>
        <MemoryRouter initialEntries={['/vulnerabilities/sql-injection']}>
          <Routes>
            <Route path="/vulnerabilities/:slug" element={<VulnerabilityDetail />} />
          </Routes>
        </MemoryRouter>
      </LanguageProvider>,
    );

    expect(screen.getByRole('heading', { name: 'تزریق SQL', level: 1 })).toBeInTheDocument();
  });

  it('renders safe external links, copy buttons, related vulnerabilities, and a related lab link', () => {
    renderVulnerabilityRoute('/vulnerabilities/sql-injection');

    expect(screen.getByRole('button', { name: /Copy Boolean probe/i })).toBeInTheDocument();

    const referenceLink = screen.getByRole('link', { name: /OWASP SQL Injection$/i });
    expect(referenceLink).toHaveAttribute('href', 'https://owasp.org/www-community/attacks/SQL_Injection');
    expect(referenceLink).toHaveAttribute('rel', 'noopener noreferrer');

    expect(screen.getByRole('link', { name: 'NoSQL Injection' })).toHaveAttribute('href', '/vulnerabilities/nosql-injection');
    expect(screen.getByRole('link', { name: /SQL injection in WHERE clause/i })).toHaveAttribute('href', '/labs/sqli-where-clause-string');
  });

  it('renders not-found behavior for unknown vulnerability slugs', () => {
    renderVulnerabilityRoute('/vulnerabilities/does-not-exist');

    expect(screen.getByRole('heading', { name: 'Vulnerability Not Found' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back/i })).toHaveAttribute('href', '/vulnerabilities');
  });

  it('does not render active flags or secrets in the reference article', () => {
    renderVulnerabilityRoute('/vulnerabilities/sql-injection');

    const articleText = within(screen.getByRole('article')).queryByText(/flag\{|hp_flag|sk_live|Bearer\s+[A-Za-z0-9._-]+/i);

    expect(articleText).not.toBeInTheDocument();
    expect(screen.queryByText(/'\s+OR\s+1=1--/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/REDACTED/).length).toBeGreaterThan(0);
  });
});

