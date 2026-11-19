import { useState, type ReactNode } from 'react';
import { Avatar } from '@veli-design/react/avatar';
import { LoadingText } from '@veli-design/react/loading-text';
import { VeliProvider } from '@veli-design/react/provider';
import { Spinner } from '@veli-design/react/spinner';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { useDocsColorScheme } from './useDocsColorScheme';

function LanguagePreview({
  name,
  children,
}: {
  name: string;
  children: (isDhivehi: boolean) => ReactNode;
}) {
  const [language, setLanguage] = useState('Dhivehi');
  const isDhivehi = language === 'Dhivehi';
  const colorScheme = useDocsColorScheme();

  return (
    <DocsPreview
      codeKey={`${name}-editorial-language-${isDhivehi ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider
        language={isDhivehi ? 'dv' : 'en'}
        colorScheme={colorScheme}
        className="flex w-full min-w-0 items-center justify-center type-body-sm-regular"
      >
        {children(isDhivehi)}
      </VeliProvider>
    </DocsPreview>
  );
}

const loadingLabels = {
  en: 'Marking all as read',
  dv: 'ކިޔާލެވިފައި ކަމަށް ބަދަލުކުރަނީ',
};

export function LoadingTextLanguageDemo() {
  return (
    <LanguagePreview name="loading-text">
      {(isDhivehi) => <LoadingText>{loadingLabels[isDhivehi ? 'dv' : 'en']}</LoadingText>}
    </LanguagePreview>
  );
}

export function SpinnerLanguageDemo() {
  return (
    <LanguagePreview name="spinner">
      {(isDhivehi) => (
        <div className="flex min-w-0 items-center gap-2">
          <Spinner aria-hidden="true" />
          <LoadingText>{loadingLabels[isDhivehi ? 'dv' : 'en']}</LoadingText>
        </div>
      )}
    </LanguagePreview>
  );
}

export function AvatarLanguageDemo() {
  return (
    <LanguagePreview name="avatar">
      {(isDhivehi) => (
        <Avatar
          type="initials"
          size="44"
          appearance="blue"
          initials="Shiham Hussain"
          alt={isDhivehi ? 'ޝިހާމް ހުސައިން' : 'Shiham Hussain'}
        />
      )}
    </LanguagePreview>
  );
}
