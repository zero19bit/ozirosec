import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminWriteup, type Writeup } from '../../lib/writeupApi';
import { useLanguage } from '../../i18n/LanguageContext';

export function AdminWriteupDetail() {
  const { id = '' } = useParams();
  const { locale } = useLanguage();
  const [writeup, setWriteup] = useState<Writeup | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    void adminWriteup(id)
      .then((response) => setWriteup(response.data))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load write-up.'));
  }, [id]);

  if (error) {
    return <main className="mx-auto max-w-4xl px-4 py-10"><Link to="/admin/writeups" className="text-emerald-300 hover:underline">← Back to Write-ups</Link><p role="alert" className="mt-6 rounded-xl bg-red-500/15 p-4 text-red-200">{error}</p></main>;
  }

  if (!writeup) {
    return <main className="py-20 text-center text-slate-400">Loading…</main>;
  }

  const translation = writeup.translations.find((item) => item.locale === locale) ?? writeup.translations[0];

  return <main className="mx-auto min-h-screen max-w-4xl px-4 py-10"><Link to="/admin/writeups" className="text-emerald-300 hover:underline">← Back to Write-ups</Link><article className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-200">{writeup.status}</span><span className="text-sm text-slate-400">{writeup.ingestion_method}</span></div><h1 className="mt-5 text-3xl font-black">{translation?.title ?? writeup.original_title}</h1><p className="mt-2 text-slate-400">{writeup.original_title}</p><p className="mt-6 whitespace-pre-wrap leading-7 text-slate-200">{translation?.short_summary}</p><dl className="mt-8 grid gap-4 border-t border-slate-800 pt-6 text-sm md:grid-cols-2"><div><dt className="text-slate-400">Source</dt><dd>{writeup.source?.name ?? 'Manual'}</dd></div><div><dt className="text-slate-400">Original author</dt><dd>{writeup.original_author ?? '—'}</dd></div><div><dt className="text-slate-400">Languages</dt><dd>{writeup.translations.map((item) => item.locale).join(', ')}</dd></div><div><dt className="text-slate-400">Related vulnerabilities</dt><dd>{writeup.vulnerabilities.join(', ') || '—'}</dd></div></dl></article></main>;
}
