import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createWriteup,
  type Translation,
  type WriteupPayload,
} from '../../lib/writeupApi';
import { useLanguage } from '../../i18n/LanguageContext';

const emptyTranslation = (locale: 'en' | 'fa'): Translation => ({
  locale,
  title: '',
  slug: '',
  short_summary: '',
  key_findings: [],
  technical_overview: '',
  attack_explanation: '',
  root_cause: '',
  impact: '',
  mitigation: '',
  developer_lessons: '',
  conclusion: '',
});

export function AdminWriteupCreate() {
  const { locale } = useLanguage();
  const navigate = useNavigate();

  const [activeLocale, setActiveLocale] = useState<'en' | 'fa'>('en');
  const [originalTitle, setOriginalTitle] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [translations, setTranslations] = useState<Translation[]>([
    emptyTranslation('en'),
    emptyTranslation('fa'),
  ]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const labels =
    locale === 'fa'
      ? {
          title: 'ایجاد رایت‌آپ',
          back: 'بازگشت به رایت‌آپ‌ها',
          original: 'عنوان اصلی',
          url: 'نشانی منبع اصلی',
          author: 'نویسنده اصلی',
          titleField: 'عنوان',
          slug: 'نامک انگلیسی',
          summary: 'خلاصه کوتاه',
          content: 'متن کامل مقاله',
          save: 'ذخیره پیش‌نویس',
          saving: 'در حال ذخیره…',
        }
      : {
          title: 'Create Write-up',
          back: 'Back to Write-ups',
          original: 'Original title',
          url: 'Original source URL',
          author: 'Original author',
          titleField: 'Title',
          slug: 'English slug',
          summary: 'Short summary',
          content: 'Main content',
          save: 'Save draft',
          saving: 'Saving…',
        };

  const current = translations.find(
    (translation) => translation.locale === activeLocale,
  )!;

  const updateTranslation = (field: keyof Translation, value: string) => {
    setTranslations((items) =>
      items.map((translation) =>
        translation.locale === activeLocale
          ? { ...translation, [field]: value }
          : translation,
      ),
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload: WriteupPayload = {
        original_title: originalTitle,
        canonical_url: canonicalUrl || null,
        original_author: author || null,
        original_language: 'en',
        translations,
      };

      const response = await createWriteup(payload);
      navigate(`/admin/writeups/${response.data.id}`);
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Unable to create the write-up.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-4 py-8">
      <Link
        to="/admin/writeups"
        className="text-sm text-emerald-300 hover:underline"
      >
        ← {labels.back}
      </Link>

      <h1 className="mt-4 text-3xl font-black">{labels.title}</h1>

      <form
        onSubmit={submit}
        className="mt-6 space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
      >
        <section className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 font-bold md:col-span-2">
            {labels.original}
            <input
              required
              value={originalTitle}
              onChange={(event) => setOriginalTitle(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
            />
          </label>

          <label className="grid gap-2 font-bold">
            {labels.url}
            <input
              type="url"
              value={canonicalUrl}
              onChange={(event) => setCanonicalUrl(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
              dir="ltr"
            />
          </label>

          <label className="grid gap-2 font-bold">
            {labels.author}
            <input
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
            />
          </label>
        </section>

        <section>
          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => setActiveLocale('en')}
              className={`rounded-xl px-4 py-2 font-bold ${
                activeLocale === 'en'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-800'
              }`}
            >
              English
            </button>

            <button
              type="button"
              onClick={() => setActiveLocale('fa')}
              className={`rounded-xl px-4 py-2 font-bold ${
                activeLocale === 'fa'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-slate-800'
              }`}
            >
              فارسی
            </button>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 font-bold">
              {labels.titleField}
              <input
                required
                value={current.title}
                onChange={(event) =>
                  updateTranslation('title', event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
              />
            </label>

            <label className="grid gap-2 font-bold">
              {labels.slug}
              <input
                required
                pattern="[a-z0-9-]+"
                value={current.slug}
                onChange={(event) =>
                  updateTranslation('slug', event.target.value)
                }
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
                dir="ltr"
              />
            </label>

            <label className="grid gap-2 font-bold">
              {labels.summary}
              <textarea
                required
                value={current.short_summary}
                onChange={(event) =>
                  updateTranslation('short_summary', event.target.value)
                }
                className="min-h-32 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
              />
            </label>

            <label className="grid gap-2 font-bold">
              {labels.content}
              <textarea
                value={current.technical_overview ?? ''}
                onChange={(event) =>
                  updateTranslation('technical_overview', event.target.value)
                }
                className="min-h-96 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-normal"
              />
            </label>
          </div>
        </section>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-500/15 p-3 text-red-200"
          >
            {error}
          </p>
        )}

        <button
          disabled={saving}
          className="rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 disabled:opacity-60"
        >
          {saving ? labels.saving : labels.save}
        </button>
      </form>
    </main>
  );
}
