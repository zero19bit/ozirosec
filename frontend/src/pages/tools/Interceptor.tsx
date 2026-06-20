import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { faLabel } from '../../utils/localizeContent';
import { useAppStore } from '../../store/useAppStore';
import { Globe, Send, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const defaultRequest = `GET /api/users/1 HTTP/1.1
Host: vulnerable-app.com
Authorization: REDACTED_AUTH_SCHEME <token>
Cookie: session=REDACTED; csrftoken=REDACTED
User-Agent: HackPath-Interceptor/1.0
Accept: application/json
Content-Type: application/json

`;

const mockResponses: Record<string, string> = {
  '200': `HTTP/1.1 200 OK
Content-Type: application/json
Server: nginx/1.18.0
X-Frame-Options: SAMEORIGIN
Cache-Control: no-store

{
  "id": 1,
  "username": "alice",
  "email": "alice@example.com",
  "role": "user",
  "created_at": "2024-01-15T10:30:00Z"
}`,
  '403': `HTTP/1.1 403 Forbidden
Content-Type: application/json
Server: nginx/1.18.0

{
  "error": "Access denied",
  "message": "You don't have permission to access this resource"
}`,
  '500': `HTTP/1.1 500 Internal Server Error
Content-Type: application/json
Server: Apache/2.4.41

{
  "error": "Internal Server Error",
  "stack": "Error: Cannot read property 'id' of undefined\n  at /app/routes/users.js:45:20\n  at Layer.handle [as handle_request]",
  "query": "SELECT * FROM users WHERE id='1' AND active=1"
}`,
  idor: `HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 2,
  "username": "admin",
  "email": "admin@company.com",
  "role": "administrator",
  "salary": 120000,
  "ssn": "123-45-6789"
}`,
};

export function Interceptor() {
  const { locale } = useLanguage();
  const tx = (value: string, replacements: Record<string, string | number> = {}) => locale === 'fa' ? faLabel(value, replacements) : Object.entries(replacements).reduce((text, [key, replacement]) => text.replaceAll(`{{${key}}}`, String(replacement)), value);
  const { darkMode } = useAppStore();
  const [request, setRequest] = useState(defaultRequest);
  const [response, setResponse] = useState('');
  const [responseType, setResponseType] = useState('200');
  const [headers, setHeaders] = useState([
    { key: 'Host', value: 'vulnerable-app.com' },
    { key: 'Authorization', value: 'Bearer <token>' },
  ]);
  const [showHeaders, setShowHeaders] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = () => {
    setIsLoading(true);
    setTimeout(() => {
      const lower = request.toLowerCase();
      let resp = responseType;
      if (lower.includes('/users/2') || lower.includes('id=2')) {
        resp = 'idor';
      } else if (lower.includes('admin') && lower.includes('inject')) {
        resp = '500';
      }
      setResponse(mockResponses[resp] ?? mockResponses['200']);
      setIsLoading(false);
    }, 600 + Math.random() * 400);
  };

  const addHeader = () => setHeaders([...headers, { key: '', value: '' }]);
  const removeHeader = (index: number) => setHeaders(headers.filter((_, idx) => idx !== index));
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    setHeaders(headers.map((header, idx) => idx === index ? { ...header, [field]: value } : header));
  };

  const tips = [
    { tip: tx('IDOR Test'), desc: tx('Change /users/1 to /users/2 and select "IDOR" response') },
    { tip: tx('Auth Header'), desc: tx('Remove Authorization header to test unauthenticated access') },
    { tip: tx('SQLi Detection'), desc: tx("Add ' to parameter values and watch for 500 errors") },
    { tip: tx('SSRF'), desc: tx('Change Host header to internal IP like 127.0.0.1') },
    { tip: tx('JWT Tampering'), desc: tx('Modify the Bearer token payload and check if accepted') },
    { tip: tx('Method Override'), desc: tx('Change GET to POST/DELETE to test access controls') },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className={`border-b ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>{tx('HTTP Interceptor Simulator')}</h1>
          </div>
          <p className={`text-base ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {tx('Educational simulation of HTTP request interception and modification. Not a real proxy.')}
          </p>
          <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
            ⚠️ {tx('Educational simulation only — no real requests are made')}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`p-4 rounded-2xl border mb-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('Simulate Response Type')}</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: '200', label: tx('200 Normal Response') },
              { id: 'idor', label: tx('IDOR - Admin Data Exposed') },
              { id: '403', label: tx('403 Forbidden') },
              { id: '500', label: tx('500 Error (Info Leak)') },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setResponseType(type.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                  responseType === type.id
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : darkMode
                      ? 'border-slate-700 text-slate-400 hover:border-slate-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center justify-between px-4 py-3 border-b ${darkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('HTTP Request Editor')}</span>
                </div>
                <button
                  onClick={() => setShowHeaders(!showHeaders)}
                  className={`flex items-center gap-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {tx('Headers')} {showHeaders ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
              </div>

              {showHeaders && (
                <div className={`p-4 border-b ${darkMode ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="space-y-2 mb-3">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          value={header.key}
                          onChange={event => updateHeader(index, 'key', event.target.value)}
                          placeholder={tx('Header name')}
                          className={`technical-ltr flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                        <input
                          value={header.value}
                          onChange={event => updateHeader(index, 'value', event.target.value)}
                          placeholder={tx('Value')}
                          className={`technical-ltr flex-1 px-3 py-1.5 rounded-lg text-xs font-mono border outline-none ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                        />
                        <button onClick={() => removeHeader(index)} className="text-red-400 hover:text-red-300">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={addHeader} className={`flex items-center gap-1 text-xs ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                    <Plus size={12} /> {tx('Add Header')}
                  </button>
                </div>
              )}

              <textarea
                value={request}
                onChange={event => setRequest(event.target.value)}
                rows={18}
                spellCheck={false}
                className={`technical-ltr w-full px-4 py-4 font-mono text-sm resize-y outline-none ${
                  darkMode ? 'bg-slate-950 text-slate-300' : 'bg-white text-slate-700'
                }`}
              />
            </div>

            <button
              onClick={sendRequest}
              disabled={isLoading}
              className="w-full mt-3 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors">
              <Send size={16} />
              {isLoading ? tx('Sending...') : tx('Send Request')}
            </button>
          </div>

          <div>
            <div className={`rounded-2xl border overflow-hidden h-full ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className={`flex items-center gap-2 px-4 py-3 border-b ${darkMode ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className={`text-xs font-mono ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tx('HTTP Response')}</span>
                {response && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded font-mono ${
                    response.includes('200') ? 'bg-green-500/20 text-green-400' :
                    response.includes('403') ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {response.split('\n')[0]?.split(' ').slice(1, 2).join(' ')} {response.split('\n')[0]?.split(' ').slice(2).join(' ')}
                  </span>
                )}
              </div>

              <pre className={`technical-ltr p-4 font-mono text-sm overflow-auto min-h-[24rem] whitespace-pre-wrap ${
                darkMode ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {isLoading
                  ? <span className={`${darkMode ? 'text-slate-500' : 'text-slate-400'} animate-pulse`}>{tx('Sending request...')}</span>
                  : response
                    ? response
                    : <span className={darkMode ? 'text-slate-600' : 'text-slate-300'}>{tx('Response will appear here after sending the request...')}</span>}
              </pre>
            </div>
          </div>
        </div>

        <div className={`mt-6 p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <h3 className={`font-bold text-sm mb-3 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{tx('Testing Tips')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tips.map(item => (
              <div key={item.tip} className={`p-3 rounded-xl ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <div className="text-xs font-bold mb-1 text-orange-400">{item.tip}</div>
                <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
