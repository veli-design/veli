'use client';

import { useState, type ReactNode } from 'react';
import { VeliProvider } from '@veli-design/react/provider';
import {
  ServiceDetail,
  type ServiceGuideline,
} from '../../components/blocks/service-detail/service-detail';
import { serviceDetailContent } from '../../service-detail-content';

export default function ServicesFixture() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<'online' | 'mixed' | 'external' | 'manual'>('online');
  const [copyFails, setCopyFails] = useState(false);
  const [actionCount, setActionCount] = useState(0);
  const [summaryState, setSummaryState] = useState('supplied');
  const [requested, setRequested] = useState(0);
  const [missing, setMissing] = useState(false);
  const [typography, setTypography] = useState(false);
  const [simpleManual, setSimpleManual] = useState(false);
  const [serviceCount, setServiceCount] = useState('default');
  const [guidelineState, setGuidelineState] = useState('supplied');
  const [metadataSet, setMetadataSet] = useState('default');
  const content = serviceDetailContent(language, mode);
  const metadata =
    metadataSet === 'fees only'
      ? { fees: content.metadata?.fees }
      : metadataSet === 'processing only'
        ? { processingTime: content.metadata?.processingTime }
        : metadataSet === 'without fees'
          ? {
              applicationTime: content.metadata?.applicationTime,
              processingTime: content.metadata?.processingTime,
              eligibility: content.metadata?.eligibility,
            }
          : content.metadata;
  const longName =
    language === 'dv'
      ? 'ވިޔަފާރީގެ ރަޖިސްޓްރޭޝަން މަޢުލޫމާތު ބަދަލުކުރުން '.repeat(5)
      : 'Update the registered business details and supporting registration information '.repeat(5);
  const emptyBodies: Record<string, ReactNode> = {
    'null body': null,
    'blank body': '   ',
    'empty array': [null, false, '  '],
    'empty fragment': <>{null}</>,
    'zero body': 0,
  };
  const fixtureGuideline: ServiceGuideline = {
    ...content.guideline!,
    ...(typography
      ? {
          content: {
            sections: [
              {
                id: 'typography',
                title: language === 'dv' ? 'ބޭނުންވާ ލިޔެކިޔުންތައް' : 'Required documents',
                body: (
                  <div data-testid="guideline-typography">
                    <h2>Document checklist</h2>
                    <ul>
                      <li>
                        Application form
                        <ol>
                          <li>Complete the relevant sections</li>
                          <li>Sign the declaration</li>
                        </ol>
                      </li>
                      <li>Supporting documents</li>
                    </ul>
                    <h3>Submission steps</h3>
                    <ol>
                      <li>
                        Prepare copies
                        <ul>
                          <li>Check every page is readable</li>
                          <li>Keep a copy for your records</li>
                        </ul>
                      </li>
                      <li>Follow the provider's instructions</li>
                    </ol>
                  </div>
                ),
              },
            ],
          },
        }
      : guidelineState === 'empty sections'
        ? { content: { sections: [] } }
        : guidelineState === 'empty section bodies'
          ? { content: { sections: [{ id: 'empty', title: 'Empty', body: null }] } }
          : guidelineState in emptyBodies
            ? { content: { body: emptyBodies[guidelineState] } }
            : {}),
    onCopyLink: async () => {
      if (copyFails) throw new Error('fixture');
    },
    summary:
      summaryState === 'supplied'
        ? content.guideline?.summary
        : {
            content: summaryState === 'blank' ? '   ' : summaryState === 'zero' ? 0 : undefined,
            isPending: summaryState === 'pending',
            error: summaryState === 'error' ? 'Fixture summary error' : undefined,
            onRequest: summaryState === 'request' ? () => setRequested(requested + 1) : undefined,
          },
  };
  return (
    <>
      <div data-testid="outside-control">
        <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
          Fixture language
        </button>
        <button onClick={() => setDark(!dark)}>Fixture theme</button>
        <button onClick={() => setCopyFails(!copyFails)}>Copy failure</button>
        <button onClick={() => setMissing(!missing)}>Missing data</button>
        <button onClick={() => setTypography(!typography)}>Typography fixture</button>
        <button onClick={() => setSimpleManual(!simpleManual)}>Simple manual forms</button>
        <div data-testid="outside-guideline-typography" dir={language === 'dv' ? 'rtl' : 'ltr'}>
          <h2>Outside heading</h2>
          <ul>
            <li>Outside unordered item</li>
          </ul>
          <ol>
            <li>Outside ordered item</li>
          </ol>
        </div>
        <label>
          Mode{' '}
          <select value={mode} onChange={(event) => setMode(event.target.value as typeof mode)}>
            {['online', 'mixed', 'external', 'manual'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Service count{' '}
          <select value={serviceCount} onChange={(event) => setServiceCount(event.target.value)}>
            {['default', '1', '3', '4', 'unbroken'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Metadata{' '}
          <select value={metadataSet} onChange={(event) => setMetadataSet(event.target.value)}>
            {['default', 'fees only', 'processing only', 'without fees'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Guideline content{' '}
          <select
            value={guidelineState}
            onChange={(event) => setGuidelineState(event.target.value)}
          >
            {[
              'supplied',
              'empty sections',
              'empty section bodies',
              ...Object.keys(emptyBodies),
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Summary{' '}
          <select value={summaryState} onChange={(event) => setSummaryState(event.target.value)}>
            {['supplied', 'pending', 'error', 'request', 'empty', 'blank', 'zero'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <p role="status">
          Actions: {actionCount}; Requests: {requested}
        </p>
      </div>
      <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
        <ServiceDetail
          {...content}
          metadata={missing ? {} : metadata}
          services={
            missing
              ? []
              : serviceCount === 'default'
                ? content.services
                : Array.from(
                    { length: serviceCount === 'unbroken' ? 1 : Number(serviceCount) },
                    (_, i) => ({
                      id: `long-${i}`,
                      name: serviceCount === 'unbroken' ? longName.replaceAll(' ', '') : longName,
                    }),
                  )
          }
          guideline={missing ? undefined : fixtureGuideline}
          apply={
            mode === 'manual'
              ? simpleManual && content.apply.mode === 'manual'
                ? {
                    ...content.apply,
                    forms: content.apply.forms.map(({ id, title, action }) => ({
                      id,
                      title,
                      action,
                    })),
                  }
                : content.apply
              : {
                  platform: content.apply.platform,
                  information: content.apply.information,
                  notice: content.apply.notice,
                  mode,
                  action: {
                    id: 'start',
                    label: 'Fixture start',
                    trailingIcon: content.apply.action?.trailingIcon,
                    onPress: () => setActionCount(actionCount + 1),
                  },
                }
          }
        />
      </VeliProvider>
    </>
  );
}
