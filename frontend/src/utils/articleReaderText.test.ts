import { describe, expect, it } from 'vitest';
import type { LocalizedVulnerabilityArticle } from '../content/vulnerabilities';
import type { Translation } from '../lib/writeupApi';
import {
  buildVulnerabilityArticleReaderText,
  buildWriteupReaderText,
  sanitizeArticleSpeechText,
  stripMarkdownForSpeech,
} from './articleReaderText';

const sectionLabels = {
  technical_overview: 'Technical overview',
  attack_explanation: 'Attack explanation',
  root_cause: 'Root cause',
  impact: 'Impact',
  mitigation: 'Mitigation',
  developer_lessons: 'Developer lessons',
  conclusion: 'Conclusion',
};

describe('article speech text sanitizer', () => {
  it('sanitizes Persian Markdown without damaging Unicode content', () => {
    expect(
      sanitizeArticleSpeechText(`
# تزریق SQL

این مقاله درباره **تزریق SQL** و \`JWT\` است.

- ورودی کاربر را اعتبارسنجی کنید.
- از [مستندات OWASP](https://owasp.org) استفاده کنید.
`),
    ).toBe('تزریق SQL\n\nاین مقاله درباره تزریق SQL و JWT است.\nورودی کاربر را اعتبارسنجی کنید.\nاز مستندات OWASP استفاده کنید.');
  });

  it('sanitizes English Markdown articles', () => {
    expect(
      sanitizeArticleSpeechText(`
## Remote Code Execution

**RCE** can happen when input reaches a command runner.
Use OWASP guidance for prevention.
`),
    ).toBe('Remote Code Execution\n\nRCE can happen when input reaches a command runner.\nUse OWASP guidance for prevention.');
  });

  it('preserves mixed Persian and English security terms', () => {
    expect(
      sanitizeArticleSpeechText('حمله XSS می‌تواند با OAuth و JWT ترکیب شود و روی port 443 اثر بگذارد.'),
    ).toBe('حمله XSS می‌تواند با OAuth و JWT ترکیب شود و روی port 443 اثر بگذارد.');
  });

  it('removes fenced code blocks completely', () => {
    const result = sanitizeArticleSpeechText(`
Before.

\`\`\`bash
nmap -sV target
\`\`\`

\`\`\`javascript
alert(document.cookie)
\`\`\`

After.
`);

    expect(result).toBe('Before.\n\nAfter.');
    expect(result).not.toContain('nmap');
    expect(result).not.toContain('alert');
  });

  it('keeps meaningful inline code and skips noisy inline code', () => {
    const result = sanitizeArticleSpeechText(
      'Useful terms: `XSS`, `CSRF`, `CVE-2026-1234`, `CWE-79`, `GET`, `POST`, `Burp Suite`, `port 8080`. Skip `curl -s https://example.test | bash`, `/etc/passwd`, `alert(document.cookie)`, and `UNION SELECT password FROM users`.',
    );

    expect(result).toContain('XSS');
    expect(result).toContain('CSRF');
    expect(result).toContain('CVE-2026-1234');
    expect(result).toContain('CWE-79');
    expect(result).toContain('GET');
    expect(result).toContain('POST');
    expect(result).toContain('Burp Suite');
    expect(result).toContain('port 8080');
    expect(result).not.toContain('curl');
    expect(result).not.toContain('/etc/passwd');
    expect(result).not.toContain('alert');
    expect(result).not.toContain('UNION SELECT');
  });

  it('converts Markdown links to visible labels only', () => {
    expect(
      sanitizeArticleSpeechText('Read [OWASP documentation](https://example.com/path) first.'),
    ).toBe('Read OWASP documentation first.');
  });

  it('removes raw URLs', () => {
    expect(
      sanitizeArticleSpeechText('See https://example.com/path?a=1 and www.example.test for details.'),
    ).toBe('See and for details.');
  });

  it('removes Markdown images completely', () => {
    expect(
      sanitizeArticleSpeechText('Intro ![network diagram](https://example.test/image.png) outro.'),
    ).toBe('Intro outro.');
  });

  it('removes embedded HTML tags while preserving visible text', () => {
    expect(
      sanitizeArticleSpeechText('<section><h2>Impact</h2><p>Stored XSS affects viewers.</p></section>'),
    ).toBe('Impact\nStored XSS affects viewers.');
  });

  it('turns headings into readable boundaries', () => {
    expect(sanitizeArticleSpeechText('# Title\n\n### Details')).toBe('Title\n\nDetails');
  });

  it('turns ordered lists into readable lines', () => {
    expect(sanitizeArticleSpeechText('1. Find input\n2. Confirm CSRF')).toBe('Find input\nConfirm CSRF');
  });

  it('turns unordered lists into readable lines', () => {
    expect(sanitizeArticleSpeechText('- XSS\n- SSRF\n- IDOR')).toBe('XSS\nSSRF\nIDOR');
  });

  it('turns blockquotes into readable text', () => {
    expect(sanitizeArticleSpeechText('> Defensive note: validate redirects.')).toBe('Defensive note: validate redirects.');
  });

  it('extracts useful Markdown table cell content without separators', () => {
    const result = sanitizeArticleSpeechText(`
| Issue | Impact |
| --- | --- |
| XSS | Account takeover |
| SSRF | Metadata access |
`);

    expect(result).toBe('Issue. Impact\n\nXSS. Account takeover\nSSRF. Metadata access');
    expect(result).not.toContain('|');
    expect(result).not.toContain('---');
  });

  it('preserves CVE and CWE identifiers', () => {
    expect(
      sanitizeArticleSpeechText('Track CVE-2026-1234 and CWE-79 in the report.'),
    ).toBe('Track CVE-2026-1234 and CWE-79 in the report.');
  });

  it('preserves common security abbreviations', () => {
    expect(
      sanitizeArticleSpeechText('XSS, CSRF, SSRF, SQL Injection, Command Injection, RCE, IDOR, JWT, OAuth, and HTTP matter.'),
    ).toBe('XSS, CSRF, SSRF, SQL Injection, Command Injection, RCE, IDOR, JWT, OAuth, and HTTP matter.');
  });

  it('removes shell command lines', () => {
    const result = sanitizeArticleSpeechText('Run the scan:\nnmap -sV target | grep open\nThen document exposed ports.');

    expect(result).toBe('Run the scan:\nThen document exposed ports.');
  });

  it('removes JavaScript payload lines', () => {
    const result = sanitizeArticleSpeechText('Payload example:\n<img src=x onerror=alert(document.cookie)>\nUse output encoding.');

    expect(result).toBe('Payload example:\n\nUse output encoding.');
  });

  it('handles empty content', () => {
    expect(sanitizeArticleSpeechText('   \n  ')).toBe('');
  });

  it('normalizes very long content deterministically', () => {
    const paragraph = 'SQL Injection allows attackers to alter queries. ';
    const result = sanitizeArticleSpeechText(`${paragraph.repeat(120)}\n\nhttps://example.test/noise`);

    expect(result).toContain('SQL Injection allows attackers to alter queries.');
    expect(result).not.toContain('https://');
    expect(result.length).toBeGreaterThan(1000);
  });

  it('normalizes whitespace without joining unrelated sentences', () => {
    expect(sanitizeArticleSpeechText('First   sentence.\n\n\nSecond\t sentence.')).toBe('First sentence.\n\nSecond sentence.');
  });
});

describe('article reader text builders', () => {
  it('builds write-up reader text from the selected translation', () => {
    const translation: Translation = {
      locale: 'en',
      title: 'Stored XSS write-up',
      slug: 'stored-xss',
      short_summary: 'A **short** summary with [context](https://example.test).',
      key_findings: ['Stored payload reaches every viewer.', 'Encoding fixes the issue.'],
      technical_overview: '## Flow\n\nUser input is rendered later.',
      mitigation: 'Use output encoding.',
    };

    const readerText = buildWriteupReaderText(translation, sectionLabels, 'Key findings');

    expect(readerText).toContain('Stored XSS write-up\n\nA short summary with context.');
    expect(readerText).toContain('Key findings\n\nStored payload reaches every viewer.\n\nEncoding fixes the issue.');
    expect(readerText).toContain('Technical overview');
    expect(readerText).toContain('Flow\n\nUser input is rendered later.');
  });

  it('keeps stripMarkdownForSpeech as a compatibility alias', () => {
    expect(stripMarkdownForSpeech('Use [OWASP](https://owasp.org).')).toBe('Use OWASP.');
  });

  it('builds vulnerability article reader text without code or HTTP examples', () => {
    const content: LocalizedVulnerabilityArticle = {
      title: 'SQL Injection',
      summary: 'SQL injection changes database queries.',
      callouts: [
        {
          type: 'warning',
          title: 'Authorized testing only',
          body: 'Use lab targets only.',
        },
      ],
      overviewSections: [
        {
          id: 'intro',
          title: 'Introduction',
          body: ['Attackers alter query structure.', 'Prepared statements prevent it.'],
        },
      ],
      httpExamples: [
        {
          id: 'request',
          title: 'Request',
          description: 'Noisy HTTP sample',
          request: 'GET /?id=1 HTTP/1.1',
          response: 'HTTP/1.1 200 OK',
        },
      ],
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
      codeExamples: [
        {
          language: 'php',
          title: 'Example',
          vulnerable: '$sql = $_GET["id"];',
          fixed: '$stmt->execute();',
        },
      ],
      developerChecklist: ['Use parameters.'],
      testerChecklist: ['Confirm authorization.'],
      misconceptions: [
        {
          myth: 'Escaping is enough.',
          correction: 'Use parameterized queries.',
        },
      ],
      reviewQuestions: [],
    };

    const readerText = buildVulnerabilityArticleReaderText(content, {
      callouts: 'Important notes',
      checklists: 'Checklists',
      misconceptions: 'Misconceptions',
    });

    expect(readerText).toContain('SQL Injection');
    expect(readerText).toContain('Authorized testing only');
    expect(readerText).toContain('Use parameters.');
    expect(readerText).not.toContain('GET /?id=1');
    expect(readerText).not.toContain('$sql');
  });
});
