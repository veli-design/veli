import { useState } from 'react';
import { ServiceDetail, type ServiceApply } from '@tradenetcorp/veli-blocks/service-detail';
import { serviceDetailContent } from '@tradenetcorp/veli-blocks/examples/service-detail-content';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function ServiceDetailDemo() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<ServiceApply['mode']>('online');
  const [action, setAction] = useState('');
  return (
    <div className="rounded-xl border border-border-base-muted">
      <div className="type-body-sm-regular grid gap-3 border-b border-border-base-muted p-4">
        <div className="flex flex-wrap items-center gap-4">
          <label>
            Service example{' '}
            <select
              value={mode}
              onChange={(event) => {
                setMode(event.target.value as ServiceApply['mode']);
                setAction('');
              }}
            >
              <option value="online">Online application</option>
              <option value="mixed">Online + external platform</option>
              <option value="external">External platform</option>
              <option value="manual">Manual forms</option>
            </select>
          </label>
          <label>
            Language{' '}
            <select
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value as 'en' | 'dv');
                setAction('');
              }}
            >
              <option value="en">English</option>
              <option value="dv">ދިވެހި</option>
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={dark}
              onChange={(event) => setDark(event.target.checked)}
            />{' '}
            Dark mode
          </label>
        </div>
        <p role="status" className="m-0">
          {action ? `${action} — preview only; nothing was submitted or downloaded.` : ''}
        </p>
      </div>
      <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
        <ServiceDetail
          key={`${language}-${mode}`}
          {...serviceDetailContent(language, mode, setAction)}
        />
      </VeliProvider>
    </div>
  );
}
