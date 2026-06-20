import { useAppStore } from '../store/useAppStore';
import { Prism as SyntaxHighlighterLib } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Props {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function SyntaxHighlighter({ code, language = 'javascript', showLineNumbers = true }: Props) {
  const { darkMode } = useAppStore();

  return (
    <SyntaxHighlighterLib
      language={language}
      style={darkMode ? oneDark : oneLight}
      showLineNumbers={showLineNumbers}
      customStyle={{
        margin: 0,
        borderRadius: '0.75rem',
        fontSize: '0.8rem',
        background: darkMode ? '#0f172a' : '#f8fafc',
        direction: 'ltr',
        textAlign: 'left',
      }}
      codeTagProps={{ dir: 'ltr', style: { direction: 'ltr', textAlign: 'left' } }}
      lineNumberStyle={{ color: darkMode ? '#475569' : '#94a3b8', direction: 'ltr', textAlign: 'right' }}
    >
      {code}
    </SyntaxHighlighterLib>
  );
}

