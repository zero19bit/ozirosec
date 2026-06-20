import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { faLabel } from '../../utils/localizeContent';
import { useAppStore } from '../../store/useAppStore';
import { Terminal, Copy, CheckCheck } from 'lucide-react';

type EncoderType = 'base64-encode' | 'base64-decode' | 'url-encode' | 'url-decode' | 'html-encode' | 'html-decode' | 'jwt-decode';

function htmlEncode(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlDecode(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function decodeJWT(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return 'Invalid JWT: must have 2-3 parts';
    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return `// Header\n${JSON.stringify(header, null, 2)}\n\n// Payload\n${JSON.stringify(payload, null, 2)}\n\n// Signature\n${parts[2] ? parts[2] : '(none)'}`;
  } catch {
    return 'Invalid JWT or unable to decode';
  }
}

function process(input: string, type: EncoderType): string {
  if (!input.trim()) return '';
  try {
    switch (type) {
      case 'base64-encode': return btoa(unescape(encodeURIComponent(input)));
      case 'base64-decode': return decodeURIComponent(escape(atob(input)));
      case 'url-encode': return encodeURIComponent(input);
      case 'url-decode': return decodeURIComponent(input);
      case 'html-encode': return htmlEncode(input);
      case 'html-decode': return htmlDecode(input);
      case 'jwt-decode': return decodeJWT(input);
      default: return input;
    }
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : 'Processing failed'}`;
  }
}

export function Encoder() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();
  const [input, setInput] = useState('');
  const [activeType, setActiveType] = useState<EncoderType>('base64-encode');
  const [copied, setCopied] = useState(false);

  const output = process(input, activeType);

  const copy = () => {
    navigator.clipboard?.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const types: { id: EncoderType; label: string }[] = [
    { id: 'base64-encode', label: tx('Base64 Encode') },
    { id: 'base64-decode', label: tx('Base64 Decode') },
    { id: 'url-encode', label: tx('URL Encode') },
    { id: 'url-decode', label: tx('URL Decode') },
    { id: 'html-encode', label: tx('HTML Encode') },
    { id: 'html-decode', label: tx('HTML Decode') },
    { id: 'jwt-decode', label: tx('JWT Decode') },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Terminal size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('Encoder / Decoder')}</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('Encode and decode data in various formats: Base64, URL, HTML, JWT')}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type selector */}
        <div className={`p-4 rounded-2xl border mb-6 flex flex-wrap gap-2 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveType(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeType === t.id
                  ? 'bg-teal-500 text-white'
                  : darkMode
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Input / Output */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {tx('Input')}
            </label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={activeType === 'jwt-decode' ? tx('Paste your JWT token here...') : tx('Enter text to process...')}
              rows={12}
              className={`technical-ltr w-full px-4 py-3 rounded-xl border font-mono text-sm resize-y outline-none transition-colors ${
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-teal-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-teal-500'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {tx('Output')}
              </label>
              {output && (
                <button onClick={copy} className="flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors">
                  {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                  {copied ? tx('Copied!') : tx('Copy')}
                </button>
              )}
            </div>
            <pre className={`technical-ltr w-full h-full min-h-[18rem] px-4 py-3 rounded-xl border font-mono text-sm overflow-auto whitespace-pre-wrap break-all ${
              darkMode
                ? 'bg-slate-800 border-slate-700 text-green-300'
                : 'bg-slate-50 border-slate-200 text-green-700'
            }`}>
              {output || <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>{tx('Output will appear here...')}</span>}
            </pre>
          </div>
        </div>

        {/* JWT specific info */}
        {activeType === 'jwt-decode' && (
          <div className={`mt-4 p-4 rounded-xl border text-sm ${darkMode ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-200/80' : 'border-yellow-200 bg-yellow-50 text-yellow-800'}`}>
            <strong>Security Note:</strong> JWT tokens decoded here are processed entirely client-side. For analysis, check the algorithm (alg header), expiry (exp claim), and whether sensitive data is in the payload.
          </div>
        )}

        {/* Examples */}
        <div className={`mt-6 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-sm mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Quick Examples')}</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Sample JWT', value: 'REDACTED.JWT.TRAINING', type: 'jwt-decode' as EncoderType },
              { label: 'SQL Marker', value: 'REDACTED_SQL_TRAINING_MARKER', type: 'url-encode' as EncoderType },
              { label: 'HTML Marker', value: '<training-marker>REDACTED</training-marker>', type: 'html-encode' as EncoderType },
              { label: 'Hello World', value: 'Hello, World!', type: 'base64-encode' as EncoderType },
            ].map(ex => (
              <button
                key={ex.label}
                onClick={() => { setInput(ex.value); setActiveType(ex.type); }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  darkMode ? 'border-slate-700 text-slate-400 hover:border-teal-500/50 hover:text-teal-400' : 'border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                }`}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
