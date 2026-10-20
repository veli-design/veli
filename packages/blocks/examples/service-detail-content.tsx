import { ArrowUpRightIcon } from '@phosphor-icons/react';
import type {
  ServiceApply,
  ServiceDetailLabels,
  ServiceDetailProps,
  ServiceAction,
  ServiceGuideline,
} from '../src/service-detail/types';

/** Fictional public-service examples. Amounts, agencies and timeframes are illustrative. */
export function serviceDetailContent(
  language: 'en' | 'dv' = 'en',
  mode: ServiceApply['mode'] = 'online',
  onAction?: (label: string) => void,
): ServiceDetailProps {
  const dv = language === 'dv';
  const text = (en: string, dhivehi: string) => (dv ? dhivehi : en);
  const labels: ServiceDetailLabels = {
    providedBy: text('Provided by', 'ޚިދުމަތް ދެއްވާ ފަރާތް'),
    serviceSummary: text('Service summary', 'ޚިދުމަތުގެ ޚުލާސާ'),
    applicationTime: text('Application time', 'ހުށަހެޅުމަށް ނަގާ ވަގުތު'),
    processingTime: text('Processing time', 'މުއާމަލާތް ނިމުމަށް ނަގާ ވަގުތު'),
    eligibility: text('Who can apply', 'ހުށަހެޅޭނެ ފަރާތް'),
    fees: text('Fees', 'ފީ'),
    feesByType: text('Fees by application type', 'އެޕްލިކޭޝަނުގެ ބާވަތުން ފީ'),
    showFees: text('Show fees', 'ފީތައް ބައްލަވާ'),
    hideFees: text('Hide fees', 'ފީތައް ފޮރުއްވާ'),
    services: text('What you can do with this service', 'މި ޚިދުމަތުން ކުރެވޭނެ ކަންތައްތައް'),
    showLess: text('Show less', 'މަދުކޮށް ދައްކަވާ'),
    moreServices: (count) => (dv ? `+${count} އިތުރު` : `+${count} more`),
    apply: text('Apply for this service', 'މި ޚިދުމަތަށް ހުށަހެޅުން'),
    applyOn: mode === 'manual' ? text('Apply', 'ހުށަހަޅުއްވާ') : text('Apply on', 'ހުށަހަޅާނީ'),
    beforeYouStart: text('Before you start', 'ފެށުމުގެ ކުރިން'),
    prerequisiteIntroduction: text('Before applying, ensure:', 'ހުށަހެޅުމުގެ ކުރިން:'),
    readGuideline: text('Read the guideline', 'ގައިޑްލައިން ކިޔުއްވާ'),
    guidelineIntroduction: text(
      'Read the guideline to prepare your documents, understand the application steps and avoid delays.',
      'ހުށަހެޅުމުގެ ކުރިން ބޭނުންވާ ލިޔެކިޔުންތަކާއި ފިޔަވަޅުތައް ބައްލަވާ.',
    ),
    guidelineUnavailable: text(
      'Service guideline is not available yet.',
      'ޚިދުމަތުގެ ގައިޑްލައިން އަދި ލިބެން ނެތް.',
    ),
    closeGuideline: text('Close guideline', 'ގައިޑްލައިން ބަންދުކުރައްވާ'),
    closeInformation: text('Close applying information', 'ހުށަހެޅުމުގެ މަޢުލޫމާތު ބަންދުކުރައްވާ'),
    guidelineContents: text('On this page', 'މި ސަފްހާގައި'),
    guidelineCaption: text('Service Guideline', 'ޚިދުމަތުގެ ގައިޑްލައިން'),
    showSummary: text('Show guideline summary', 'ގައިޑްލައިންގެ ޚުލާސާ ދައްކަވާ'),
    showFullGuideline: text('Show full guideline', 'ފުރިހަމަ ގައިޑްލައިން ދައްކަވާ'),
    summaryPending: text('Loading summary', 'ޚުލާސާ ލޯޑްވަނީ'),
    copyGuidelineLink: text('Copy guideline link', 'ގައިޑްލައިންގެ ލިންކު ކޮޕީކުރައްވާ'),
    linkCopied: text('Guideline link copied', 'ގައިޑްލައިންގެ ލިންކު ކޮޕީކުރެވިއްޖެ'),
    linkCopyFailed: text('Could not copy link', 'ލިންކު ކޮޕީނުކުރެވުނު'),
  };
  const title = text('Business registration and changes', 'ވިޔަފާރި ރަޖިސްޓްރީކުރުމާއި ބަދަލުތައް');
  const names = [
    text('Register a new business', 'އާ ވިޔަފާރިއެއް ރަޖިސްޓްރީކުރުން'),
    text('Change directors', 'ޑިރެކްޓަރުން ބަދަލުކުރުން'),
    text('Change managing director', 'މެނޭޖިންގ ޑިރެކްޓަރު ބަދަލުކުރުން'),
    text('Update shareholders', 'ހިއްސާދާރުންގެ މަޢުލޫމާތު ބަދަލުކުރުން'),
    text('Change registered address', 'ރަޖިސްޓްރީ އެޑްރެސް ބަދަލުކުރުން'),
    text('Change business activities', 'ވިޔަފާރީގެ ހަރަކާތްތައް ބަދަލުކުރުން'),
    text('Update share capital', 'ހިއްސާގެ ރައުސުލްމާލު ބަދަލުކުރުން'),
    text('Amend registration details', 'ރަޖިސްޓްރީގެ މަޢުލޫމާތު ބަދަލުކުރުން'),
    text('Request a registration extract', 'ރަޖިސްޓްރީގެ ކޮޕީއެއް އެދުން'),
  ];
  const amounts = ['2,000', '200', '250', '150', '100', '200', '100', '250', '100'];
  const fees = names.map((label, i) => ({ id: `fee-${i}`, label, value: `MVR ${amounts[i]}` }));
  const prerequisites = [
    text(
      'You are the business owner or an authorized representative with permission to submit this request.',
      'މި ހުށަހެޅުމަށް ހުއްދަ ލިބިފައިވާ ވިޔަފާރީގެ ވެރިފަރާތް ނުވަތަ މަންދޫބެއް ކަމަށްވުން.',
    ),
    text(
      'Have the registration reference and supporting documents ready for the change you want to make.',
      'ބަދަލުކުރަން ބޭނުންވާ ކަމާއި ގުޅޭ ރަޖިސްޓްރީ ނަންބަރާއި ލިޔެކިޔުންތައް ތައްޔާރުކޮށްފައިވުން.',
    ),
  ];
  const guideline: ServiceGuideline = {
    title,
    description: text(
      'Use this guide to prepare a registration request or update an existing business record. Requirements vary with the type of application.',
      'އާ ރަޖިސްޓްރޭޝަންއަކަށް އެދުމަށް ނުވަތަ މަޢުލޫމާތު ބަދަލުކުރުމަށް މި ގައިޑްލައިން ބައްލަވާ.',
    ),
    updatedText: text(
      'Last updated on 20 October 2026',
      'އެންމެ ފަހުން ބަދަލުކުރީ 20 އޮކްޓޯބަރު 2026',
    ),
    content: {
      sections: [
        {
          id: 'before',
          title: labels.beforeYouStart,
          body: (
            <>
              <p>
                {text(
                  'Choose the request that best describes the change you need. Prepare clear copies of the relevant records before you begin.',
                  'ބޭނުންވާ ބަދަލަށް ފެތޭ އެދުން ހޮއްވަވާ. ފެށުމުގެ ކުރިން ލިޔެކިޔުންތަކުގެ ސާފު ކޮޕީތައް ތައްޔާރުކުރައްވާ.',
                )}
              </p>
              <ul>
                {prerequisites.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </>
          ),
        },
        {
          id: 'fees',
          title: text('Service fees', 'ޚިދުމަތުގެ ފީ'),
          body: (
            <>
              <p>
                {text(
                  'The following sample amounts demonstrate how fees are presented for each request. Confirm the applicable fee with the service provider before applying.',
                  'މި އަދަދުތަކަކީ މިސާލެކެވެ. ހުށަހެޅުމުގެ ކުރިން ފީ ކަށަވަރުކުރައްވާ.',
                )}
              </p>
              <table className="veli-service-detail-fee-table">
                <caption className="veli-service-detail-sr-only">
                  {text('Illustrative fees by request', 'އެދުމުގެ ބާވަތުން ފީގެ މިސާލު')}
                </caption>
                <tbody>
                  {fees.map((fee) => (
                    <tr key={fee.id}>
                      <th scope="row">{fee.label}</th>
                      <td>
                        <bdi dir="ltr" lang="en" className="veli-service-detail-latin">
                          {fee.value}
                        </bdi>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ),
        },
        {
          id: 'documents',
          title: text('Documents to prepare', 'ތައްޔާރުކުރަންވާ ލިޔެކިޔުންތައް'),
          body: (
            <>
              <p>
                {text(
                  'The documents needed depend on your request. Keep related records together and ensure names and references agree across the application.',
                  'ބޭނުންވާ ލިޔެކިޔުންތައް އެދުމުގެ ބާވަތާއި ގުޅެއެވެ. ނަންތަކާއި ނަންބަރުތައް އެއްގޮތްތޯ ބައްލަވާ.',
                )}
              </p>
              <ul>
                <li>
                  {text(
                    'Proof of authority to act for the business',
                    'ވިޔަފާރީގެ ފަރާތުން ހުށަހެޅުމުގެ ހުއްދަ',
                  )}
                </li>
                <li>
                  {text(
                    'Current registration details and a description of the requested change',
                    'މިހާރުގެ ރަޖިސްޓްރީ މަޢުލޫމާތާއި ބޭނުންވާ ބަދަލު',
                  )}
                </li>
                <li>
                  {text(
                    'Supporting resolutions or other records relevant to the request',
                    'އެދުމާއި ގުޅޭ ނިންމުންތަކާއި އެހެން ލިޔެކިޔުންތައް',
                  )}
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'register',
          title: names[0],
          body: (
            <>
              <p>
                {text(
                  'Enter the proposed business name, contact address and principal activities. Add the people who will be responsible for the business and check their details carefully.',
                  'ވިޔަފާރީގެ ނަމާއި އެޑްރެހާއި ހަރަކާތްތައް ލިޔުއްވާ. ޒިންމާދާރު ފަރާތްތަކުގެ މަޢުލޫމާތު ބައްލަވާ.',
                )}
              </p>
              <p>
                {text(
                  'Review the supporting documents before submitting. If additional information is requested, respond using the contact method provided in your application.',
                  'ހުށަހެޅުމުގެ ކުރިން ލިޔެކިޔުންތައް ބައްލަވާ. އިތުރު މަޢުލޫމާތު އެދިއްޖެނަމަ ޖަވާބު ދެއްވާ.',
                )}
              </p>
            </>
          ),
        },
        {
          id: 'changes',
          title: text('Update an existing registration', 'ރަޖިސްޓްރީ މަޢުލޫމާތު ބަދަލުކުރުން'),
          body: (
            <>
              <p>
                {text(
                  'Identify the registration record and select the details you want to change. Describe each change clearly and attach records that support it.',
                  'ރަޖިސްޓްރީ ރެކޯޑު ހޮއްވަވާ. ބޭނުންވާ ބަދަލުތައް ސާފުކޮށް ލިޔެ ލިޔެކިޔުންތައް ހިމަނާލައްވާ.',
                )}
              </p>
              <p>
                {text(
                  'For changes affecting several people or business activities, check that all required approvals are included. Keep a copy of the completed request for your records.',
                  'އެތައް ފަރާތަކަށް އަސަރުކުރާ ބަދަލުތަކަށް ބޭނުންވާ ހުއްދަތައް ހިމެނޭތޯ ބައްލަވާ. އެދުމުގެ ކޮޕީއެއް ބަހައްޓަވާ.',
                )}
              </p>
            </>
          ),
        },
        {
          id: 'apply',
          title: text('How to apply', 'ހުށަހެޅޭނެ ގޮތް'),
          body: (
            <ol>
              <li>
                {text(
                  'Choose the application type and prepare the required documents.',
                  'އެދުމުގެ ބާވަތް ހޮއްވަވާ. ލިޔެކިޔުންތައް ތައްޔާރުކުރައްވާ.',
                )}
              </li>
              <li>
                {text(
                  'Complete the application and review all information.',
                  'އެދުން ފުރުއްވާ. މަޢުލޫމާތު ބައްލަވާ.',
                )}
              </li>
              <li>
                {text(
                  'Submit through the channel specified by the service provider.',
                  'ޚިދުމަތް ދޭ ފަރާތުން ބަޔާންކުރާ ގޮތަށް ހުށަހަޅާ.',
                )}
              </li>
            </ol>
          ),
        },
        {
          id: 'after',
          title: text('After you apply', 'ހުށަހެޅުމަށްފަހު'),
          body: (
            <p>
              {text(
                'Keep the acknowledgement or reference supplied by the provider. Use it when asking about your request and provide any additional information requested.',
                'ޚިދުމަތް ދޭ ފަރާތުން ދޭ ރެފަރެންސް ނަންބަރު ބަހައްޓަވާ. އެދުމާއި ގުޅޭ ސުވާލުތަކުގައި އެ ނަންބަރު ބޭނުންކުރައްވާ.',
              )}
            </p>
          ),
        },
        {
          id: 'time',
          title: text('How long will it take?', 'ކިހާ ވަގުތެއް ނަގާނެތޯ؟'),
          body: (
            <p>
              {text(
                'Allow 1 to 5 working days for this illustrative request. The provider will confirm the actual timeframe and whether more information is needed.',
                'މި މިސާލުގައި 1 އިން 5 މަސައްކަތު ދުވަހެއް ނަގާނެއެވެ. އަސްލު ވަގުތު ޚިދުމަތް ދޭ ފަރާތުން ކަށަވަރުކުރާނެއެވެ.',
              )}
            </p>
          ),
        },
      ],
    },
    summary: {
      content: (
        <p>
          {text(
            'Prepare your registration reference, proof of authority and supporting documents. Select the request you need, check the applicable fee and review the information before submitting.',
            'ރަޖިސްޓްރީ ނަންބަރާއި ހުއްދައާއި ލިޔެކިޔުންތައް ތައްޔާރުކުރައްވާ. ފީއާއި މަޢުލޫމާތު ބަލައި ހުށަހަޅާ.',
          )}
        </p>
      ),
    },
    onCopyLink: () => navigator.clipboard.writeText(window.location.href),
  };
  function action(
    id: string,
    label: string,
    extra: {
      appearance?: ServiceAction['appearance'];
      trailingIcon?: ServiceAction['trailingIcon'];
    } = {},
  ): ServiceAction {
    return onAction
      ? { id, label, onPress: () => onAction(label), ...extra }
      : {
          id,
          label,
          isDisabled: true,
          disabledReason: text(
            'Interactive preview only. No application will be submitted.',
            'މިއީ މިސާލެކެވެ. އެދުމެއް ހުށަނުހެޅޭނެއެވެ.',
          ),
          ...extra,
        };
  }
  const steps =
    mode === 'manual'
      ? [
          {
            id: 'download',
            title: text('Download and complete the form', 'ފޯމު ޑައުންލޯޑްކޮށް ފުރުއްވާ'),
            description: text(
              'Choose the application or cancellation form and complete the relevant sections.',
              'އެދުމުގެ ނުވަތަ ކެންސަލްކުރުމުގެ ފޯމު ހޮވައި ފުރުއްވާ.',
            ),
          },
          {
            id: 'submit',
            title: text('Submit to the service provider', 'ޚިދުމަތް ދޭ ފަރާތަށް ހުށަހަޅާ'),
            description: text(
              'Follow the submission instructions supplied with your form and keep a copy for your records.',
              'ފޯމާއެކު ދީފައިވާ އިރުޝާދަށް ތަބާވެ ހުށަހަޅާ. ކޮޕީއެއް ބަހައްޓަވާ.',
            ),
          },
        ]
      : mode === 'external'
        ? [
            {
              id: 'start',
              title: text('Continue to the service portal', 'ޚިދުމަތުގެ ޕޯޓަލަށް ދުރުވާ'),
              description: text(
                'Select Start to continue on the provider’s portal.',
                'ޚިދުމަތް ދޭ ފަރާތުގެ ޕޯޓަލަށް ދިއުމަށް ފައްޓަވާ ފިތާލައްވާ.',
              ),
            },
            {
              id: 'follow',
              title: text('Follow the portal instructions', 'ޕޯޓަލްގެ އިރުޝާދަށް ތަބާވެ ހުށަހަޅާ'),
              description: text(
                'The provider manages the application and any follow-up on that platform.',
                'އެ ޕޯޓަލްގައި އެދުމާއި އެދުމުގެ ކުރިއެރުން ބައްލަވާ.',
              ),
            },
          ]
        : [
            {
              id: 'choose',
              title: text('Choose your application', 'އެދުމުގެ ބާވަތް ހޮއްވަވާ'),
              description: text(
                'Select the type of registration or change you need.',
                'ބޭނުންވާ ރަޖިސްޓްރޭޝަން ނުވަތަ ބަދަލު ހޮއްވަވާ.',
              ),
            },
            ...(mode === 'mixed'
              ? [
                  {
                    id: 'continue',
                    title: text(
                      'Continue on another platform if needed',
                      'ބޭނުންވެއްޖެނަމަ އެހެން ޕޯޓަލަކުން ކުރިއަށް ދުރުވާ',
                    ),
                    description: text(
                      'Some application types continue on a provider’s platform. Follow the instructions for your selection.',
                      'ބައެއް އެދުންތައް އެހެން ޕޯޓަލަކަށް ގެންދާނެއެވެ. ހޮވާފައިވާ އެދުމުގެ އިރުޝާދަށް ތަބާވެ ހުށަހަޅާ.',
                    ),
                  },
                ]
              : []),
            {
              id: 'review',
              title: text('Review and submit', 'މަޢުލޫމާތު ބަލައި ހުށަހަޅާ'),
              description: text(
                'Check the details and supporting documents before sending the request.',
                'އެދުން ފޮނުވުމުގެ ކުރިން މަޢުލޫމާތާއި ލިޔެކިޔުންތައް ބައްލަވާ.',
              ),
            },
            {
              id: 'keep',
              title: text('Keep your application reference', 'އެދުމުގެ ނަންބަރު ބަހައްޓަވާ'),
              description: text(
                'Use the reference supplied by the provider for any follow-up.',
                'އެދުމާއި ގުޅޭ ސުވާލުތަކުގައި ރެފަރެންސް ނަންބަރު ބޭނުންކުރައްވާ.',
              ),
            },
          ];
  const base = {
    platform: {
      name:
        mode === 'manual'
          ? text('Manually', 'މެނުއަލްކޮށް')
          : mode === 'external'
            ? text('Business Services Portal', 'ވިޔަފާރީގެ ޚިދުމަތުގެ ޕޯޓަލް')
            : text('Public Services', 'އާންމު ޚިދުމަތް'),
    },
    information: { title: text('How to apply', 'ހުށަހެޅޭނެ ގޮތް'), steps },
    notice:
      mode === 'online'
        ? undefined
        : mode === 'manual'
          ? {
              title: text(
                'Submit the completed form to the service provider',
                'ފުރާފައިވާ ފޯމު ޚިދުމަތް ދޭ ފަރާތަށް ހުށަހަޅާ',
              ),
              description: text(
                'Download the appropriate form and follow its submission instructions.',
                'ބޭނުންވާ ފޯމު ޑައުންލޯޑްކޮށް އިރުޝާދަށް ތަބާވެ ހުށަހަޅާ.',
              ),
            }
          : mode === 'external'
            ? {
                title: text(
                  'This service continues on another platform',
                  'މި ޚިދުމަތް އެހެން ޕޯޓަލަކުން ކުރިއަށް ގެންދަވާ',
                ),
                description: text(
                  'Complete the application and follow up with the provider on its own portal.',
                  'އެދުން ފުރުމަށާއި ކުރިއެރުން ބެލުމަށް ޚިދުމަތް ދޭ ފަރާތުގެ ޕޯޓަލް ބޭނުންކުރައްވާ.',
                ),
              }
            : {
                title: text(
                  'You may continue on an external platform',
                  'އެހެން ޕޯޓަލަކަށް ދިއުމަށް ޖެހިދާނެ',
                ),
                description: text(
                  'Some applications continue on a provider’s platform. Check the instructions for the option you select.',
                  'ބައެއް އެދުންތައް އެހެން ޕޯޓަލަކުން ކުރިއަށް ގެންދަވާން ޖެހޭނެއެވެ. ހޮވާފައިވާ ބާވަތުގެ އިރުޝާދު ބައްލަވާ.',
                ),
              },
  };
  return {
    title,
    labels,
    description: text(
      'Create a new business registration or update directors, ownership, address and business activities.',
      'އާ ވިޔަފާރިއެއް ރަޖިސްޓްރީކުރުން ނުވަތަ ޑިރެކްޓަރުން، ވެރިފަރާތް، އެޑްރެސް އަދި ހަރަކާތްތައް ބަދަލުކުރުން.',
    ),
    provider: { name: text('Business Registration Office', 'ވިޔަފާރި ރަޖިސްޓްރީ އޮފީސް') },
    metadata: {
      applicationTime: text('About 15 minutes', '15 މިނެޓް ހާއެއް'),
      processingTime: text('1 to 5 working days', '1 އިން 5 މަސައްކަތު ދުވަސް'),
      eligibility: text(
        'Authorized business representatives',
        'ހުއްދަ ލިބިފައިވާ ވިޔަފާރީގެ މަންދޫބުން',
      ),
      feeSummary: dv ? '100 – 2,000 ރުފިޔާ' : 'MVR 100 – 2,000',
      fees,
    },
    services: mode === 'external' ? [] : names.map((name, i) => ({ id: `service-${i}`, name })),
    prerequisites,
    guideline,
    apply:
      mode === 'manual'
        ? {
            ...base,
            mode,
            forms: [
              {
                id: 'application',
                title: text(
                  'Business registration application',
                  'ވިޔަފާރި ރަޖިސްޓްރީކުރުމުގެ އެދުން',
                ),
                fileMeta: 'PDF · 240 KB',
                action: action('application', text('Download Form', 'ފޯމު ޑައުންލޯޑްކުރައްވާ')),
                guideline: {
                  title: text('Completing the registration form', 'ރަޖިސްޓްރީ ފޯމު ފުރުން'),
                  content: {
                    body: (
                      <p>
                        {text(
                          'Complete each applicable section, attach the supporting records and follow the submission instructions on the form.',
                          'ބޭނުންވާ ބައިތައް ފުރައި ލިޔެކިޔުންތައް ހިމަނާލައްވާ. ފޯމުގެ އިރުޝާދަށް ތަބާވެ ހުށަހަޅާ.',
                        )}
                      </p>
                    ),
                  },
                },
              },
              {
                id: 'cancellation',
                title: text(
                  'Registration cancellation request',
                  'ރަޖިސްޓްރީ ކެންސަލްކުރުމުގެ އެދުން',
                ),
                fileMeta: 'PDF · 180 KB',
                action: action(
                  'cancellation',
                  text('Download Cancellation Form', 'ކެންސަލްކުރުމުގެ ފޯމު ޑައުންލޯޑްކުރައްވާ'),
                  { appearance: 'transparent' },
                ),
                guideline: {
                  title: text('Completing the cancellation form', 'ކެންސަލްކުރުމުގެ ފޯމު ފުރުން'),
                  content: {
                    body: (
                      <p>
                        {text(
                          'Include the registration reference and reason for cancellation. The provider will explain any additional steps.',
                          'ރަޖިސްޓްރީ ނަންބަރާއި ކެންސަލްކުރާ ސަބަބު ހިމަނާލައްވާ. އިތުރު ފިޔަވަޅުތައް ޚިދުމަތް ދޭ ފަރާތުން ބަޔާންކުރާނެއެވެ.',
                        )}
                      </p>
                    ),
                  },
                },
              },
            ],
          }
        : {
            ...base,
            mode,
            action: action(
              'start',
              text('Start', 'ފައްޓަވާ'),
              mode === 'external'
                ? { trailingIcon: <ArrowUpRightIcon weight="bold" size={20} /> }
                : {},
            ),
          },
  };
}
