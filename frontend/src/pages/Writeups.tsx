import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../i18n/LanguageContext';
import { apiFetch } from '../lib/apiClient';
import type { Paginated, Writeup } from '../lib/writeupApi';

const copy = {
  en: {
    title: 'Security Write-ups',
    intro: 'Original HackPath summaries and defensive analysis of published security research.',
    search: 'Search write-ups',
    all: 'All',
    featured: 'Featured research',
    latest: 'Latest research',
    empty: 'No published write-ups matched your filters.',
    fallback: 'This summary is shown in its available language.',
    attribution: 'HackPath provides an original summary and analysis. Read the full research at the original source.',
    read: 'Read write-up',
    source: 'Original source',
    filters: 'Filters',
    difficulty: 'Difficulty',
    tag: 'Tag',
    back: 'Back to library',
    findings: 'Key findings',
    sections: {
      technical_overview: 'Technical overview',
      attack_explanation: 'Attack explanation',
      root_cause: 'Root cause',
      impact: 'Impact',
      mitigation: 'Mitigation',
      developer_lessons: 'Developer lessons',
      conclusion: 'Conclusion',
    },
  },
  fa: {
    title: 'رایت‌آپ‌های امنیتی',
    intro: 'خلاصه‌ها و تحلیل‌های دفاعی HackPath از پژوهش‌های منتشرشدهٔ امنیتی.',
    search: 'جست‌وجوی رایت‌آپ‌ها',
    all: 'همه',
    featured: 'پژوهش‌های منتخب',
    latest: 'جدیدترین پژوهش‌ها',
    empty: 'رایت‌آپ منتشرشده‌ای با این فیلترها پیدا نشد.',
    fallback: 'این محتوا به زبان موجود نمایش داده می‌شود.',
    attribution: 'HackPath یک خلاصه و تحلیل اصیل ارائه می‌کند. پژوهش کامل را در منبع اصلی بخوانید.',
    read: 'مطالعهٔ رایت‌آپ',
    source: 'منبع اصلی',
    filters: 'فیلترها',
    difficulty: 'سطح دشواری',
    tag: 'برچسب',
    back: 'بازگشت به کتابخانه',
    findings: 'یافته‌های کلیدی',
    sections: {
      technical_overview: 'نمای فنی',
      attack_explanation: 'توضیح مسیر حمله',
      root_cause: 'علت ریشه‌ای',
      impact: 'تأثیر',
      mitigation: 'راهکارهای دفاعی',
      developer_lessons: 'نکات توسعه‌دهنده',
      conclusion: 'جمع‌بندی',
    },
  },
} as const;

function External({
  href,
  children,
}: {
  href?: string | null;
  children: React.ReactNode;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-emerald-400 underline-offset-4 hover:underline"
      dir="ltr"
    >
      {children}
    </a>
  );
}

function MarkdownContent({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="mt-10 text-3xl font-black first:mt-0">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mt-8 text-2xl font-black first:mt-0">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mt-6 text-xl font-bold">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="my-4 leading-8 first:mt-0 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="my-4 list-disc space-y-2 ps-6">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="my-4 list-decimal space-y-2 ps-6">{children}</ol>
        ),
        li: ({ children }) => <li className="ps-1">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="my-5 border-s-4 border-emerald-400/60 ps-4 italic text-slate-300">
            {children}
          </blockquote>
        ),
        code: ({ children }) => (
          <code className="rounded bg-emerald-400/10 px-1.5 py-0.5 font-mono text-sm text-emerald-200">
            {children}
          </code>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function Card({ item }: { item: Writeup }) {
  const { locale } = useLanguage();
  const t = copy[locale];

  const title =
    item.translations.find((x) => x.locale === locale)?.title ??
    item.translations[0]?.title ??
    item.original_title;

  const slug =
    item.translations.find((x) => x.locale === locale)?.slug ??
    item.translations[0]?.slug;

  const summary =
    item.translations.find((x) => x.locale === locale)?.short_summary ??
    item.translations[0]?.short_summary;

  return (
    <article className="flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
      <div className="mb-3 flex min-w-0 max-w-full flex-wrap gap-2 text-xs">
        <span className="overflow-anywhere max-w-full rounded-full bg-emerald-400/15 px-2 py-1 text-emerald-300">
          {item.difficulty ?? 'research'}
        </span>

        {item.is_featured && (
          <span className="overflow-anywhere max-w-full rounded-full bg-amber-400/15 px-2 py-1 text-amber-200">
            ★ {t.featured}
          </span>
        )}
      </div>

      <h2 className="overflow-anywhere min-w-0 max-w-full text-xl font-black leading-snug">
        {title}
      </h2>

      <p className="overflow-anywhere mt-3 line-clamp-3 min-w-0 max-w-full text-sm leading-6 text-slate-300">
        {summary}
      </p>

      <div className="mt-4 flex min-w-0 max-w-full flex-wrap gap-2 text-xs text-slate-400">
        {item.tags.map((tag) => (
          <span key={tag} className="overflow-anywhere max-w-full">
            #{tag}
          </span>
        ))}

        {item.vulnerabilities.map((v) => (
          <span key={v} className="overflow-anywhere max-w-full rounded bg-slate-800 px-2 py-1">
            {v}
          </span>
        ))}

        {item.labs.length > 0 && (
          <span className="rounded bg-cyan-400/10 px-2 py-1 text-cyan-200">
            Labs: {item.labs.length}
          </span>
        )}
      </div>

      <div className="mt-auto flex min-w-0 max-w-full flex-col gap-3 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span className="overflow-anywhere min-w-0 max-w-full">
          {item.source?.name ?? item.original_author ?? 'HackPath'}
        </span>

        <div className="flex min-w-0 max-w-full flex-wrap gap-3">
          <External href={item.canonical_url}>{t.source}</External>

          {slug && (
            <Link
              className="overflow-anywhere max-w-full font-bold text-emerald-300"
              to={`/writeups/${slug}?locale=${locale}`}
            >
              {t.read}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
export function Writeups() {
  const { locale } = useLanguage();
  const t = copy[locale];
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = useMemo(() => {
    const queryParams = new URLSearchParams(params);
    queryParams.set('locale', locale);

    return queryParams.toString();
  }, [params, locale]);

  useEffect(() => {
    let active = true;

    setLoading(true);

    apiFetch<Paginated<Writeup>>(`writeups?${query}`)
      .then((response) => {
        if (active) {
          setItems(response.data ?? []);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : 'Request failed.',
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [query]);

  const setFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(params);

    if (value) {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }

    setParams(nextParams);
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl overflow-x-hidden px-4 py-10">
      <header className="max-w-3xl">
        <h1 className="overflow-anywhere text-4xl font-black">{t.title}</h1>
        <p className="overflow-anywhere mt-3 leading-7 text-slate-300">{t.intro}</p>
      </header>

      <section className="my-8 w-full min-w-0 max-w-full rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="sr-only">{t.filters}</h2>

        <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-3 md:grid-cols-4">
          <input
            aria-label={t.search}
            defaultValue={params.get('search') ?? ''}
            onChange={(event) => setFilter('search', event.target.value)}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder={t.search}
          />

          <select
            aria-label={t.difficulty}
            value={params.get('difficulty') ?? ''}
            onChange={(event) => setFilter('difficulty', event.target.value)}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
          >
            <option value="">
              {t.difficulty}: {t.all}
            </option>

            {['beginner', 'intermediate', 'advanced', 'expert'].map(
              (difficulty) => (
                <option key={difficulty}>{difficulty}</option>
              ),
            )}
          </select>

          <input
            aria-label={t.tag}
            defaultValue={params.get('tag') ?? ''}
            onChange={(event) => setFilter('tag', event.target.value)}
            className="w-full min-w-0 max-w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2"
            placeholder={t.tag}
          />

          <label className="overflow-anywhere flex w-full min-w-0 max-w-full items-center gap-2 rounded-xl border border-slate-700 px-3 py-2">
            <input
              type="checkbox"
              checked={params.get('featured') === '1'}
              onChange={(event) =>
                setFilter('featured', event.target.checked ? '1' : '')
              }
            />
            {t.featured}
          </label>
        </div>
      </section>

      {error && (
        <p role="alert" className="overflow-anywhere rounded-xl bg-red-500/15 p-4 text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-12 text-center text-slate-400">Loading…</p>
      ) : items.length === 0 ? (
        <p className="overflow-anywhere py-12 text-center text-slate-400">{t.empty}</p>
      ) : (
        <>
          <h2 className="overflow-anywhere mb-4 text-2xl font-black">{t.latest}</h2>

          <div className="grid w-full min-w-0 max-w-full grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}
export function WriteupDetail() {
  const { slug = '' } = useParams();
  const { locale } = useLanguage();
  const t = copy[locale];
  const [item, setItem] = useState<Writeup | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<{ data: Writeup }>(
      `writeups/${encodeURIComponent(slug)}?locale=${locale}`,
    )
      .then((response) => setItem(response.data))
      .catch((requestError) =>
        setError(
          requestError instanceof Error ? requestError.message : 'Not found.',
        ),
      );
  }, [slug, locale]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <Link to="/writeups">{t.back}</Link>
        <p role="alert" className="mt-6">
          {error}
        </p>
      </main>
    );
  }

  if (!item) {
    return <main className="py-20 text-center text-slate-400">Loading…</main>;
  }

  const translation =
    item.translations.find((entry) => entry.locale === locale) ??
    item.translations[0];

  const sections = [
    'technical_overview',
    'attack_explanation',
    'root_cause',
    'impact',
    'mitigation',
    'developer_lessons',
    'conclusion',
  ] as const;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <Link to="/writeups" className="hover:text-emerald-300">
          {t.back}
        </Link>{' '}
        / {translation?.title}
      </nav>

      <article className="mt-6">
        <h1 className="text-4xl font-black">{translation?.title}</h1>

        {item.translation_fallback && (
          <p className="mt-4 rounded-xl bg-amber-400/10 p-3 text-amber-100">
            {t.fallback}
          </p>
        )}

        <p className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm leading-7 text-slate-300">
          {t.attribution}
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>{item.source?.name}</span>
          <span>{item.original_author}</span>
          <span>{item.difficulty}</span>
          <span>{item.reading_time_minutes} min</span>
          <External href={item.canonical_url}>{t.source}</External>
        </div>

        {translation?.short_summary && (
          <div className="mt-8 text-lg text-slate-200">
            <MarkdownContent>{translation.short_summary}</MarkdownContent>
          </div>
        )}

        {translation?.key_findings && translation.key_findings.length > 0 && (
          <section className="mt-8">
            <h2 className="text-2xl font-black">{t.findings}</h2>

            <ul className="mt-3 list-disc space-y-2 ps-6">
              {translation.key_findings.map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </section>
        )}

        {sections.map((section) => {
          const content = translation?.[section];

          if (!content) {
            return null;
          }

          return (
            <section key={section} id={section} className="mt-10">
              <h2 className="text-2xl font-black">{t.sections[section]}</h2>

              <div className="mt-3 text-slate-200">
                <MarkdownContent>{content}</MarkdownContent>
              </div>
            </section>
          );
        })}

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="mt-10 rounded-xl border border-slate-700 px-3 py-2 text-sm"
        >
          ↑ Top
        </button>
      </article>
    </main>
  );
}
