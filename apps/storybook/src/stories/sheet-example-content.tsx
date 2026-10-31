import { useVeliLanguage } from '@veli-design/react/provider';

// Fictional, local example data. These are not service requirements or live applications.
export const sheetExampleCopy = {
  en: {
    example: 'Example service',
    done: 'Back to applications',
    back: 'Back to service',
    reset: 'Reset',
    apply: 'Apply filters',
    showing: 'Showing',
    closed: 'Closed',
    opened: 'Open',
    summary: {
      context: 'My applications',
      open: 'View application',
      title: 'Application details',
      description: 'A quick view of your request.',
      hint: 'Review a request without leaving your application list.',
      fields: [
        ['Service', 'Business registration'],
        ['Reference', 'DEMO-1042'],
        ['Applicant', 'Amina Ali'],
        ['Status', 'In review'],
      ],
    },
    filters: {
      context: 'Find a service',
      open: 'Filter results',
      title: 'Filter results',
      description: 'Choose what to include in your search.',
      hint: 'Narrow your search, then return to the results.',
      label: 'Service category',
      options: [
        { id: 'all', label: 'All categories' },
        { id: 'immigration', label: 'Immigration & Border Control' },
        { id: 'employment', label: 'Labour & Employment' },
        { id: 'digital', label: 'Digital Government & Technology' },
      ],
    },
    guide: {
      context: 'Business registration',
      open: 'Before you apply',
      title: 'Before you apply',
      description: 'Prepare your information before starting a request.',
      hint: 'Keep the service page nearby while you read the guidance.',
      sections: [
        {
          title: 'Choose your request',
          body: 'Decide whether you are registering a business or updating an existing record.',
          items: [
            'Check that you have selected the right service.',
            'Keep an existing registration reference nearby.',
          ],
        },
        {
          title: 'Prepare your documents',
          body: 'The records you need depend on the request. Check the service’s document list before you start.',
          items: [
            'Use clear, readable copies.',
            'Check that names and references match across your documents.',
          ],
        },
        {
          title: 'Review before sending',
          body: 'Read your answers and check the attachments before submitting the application.',
          items: [
            'Confirm your contact details are up to date.',
            'Keep your application reference so you can find the request later.',
          ],
        },
      ],
    },
  },
  dv: {
    example: 'މިސާލު ޚިދުމަތް',
    done: 'އެޕްލިކޭޝަންތަކަށް އަނބުރާ ދާ',
    back: 'ޚިދުމަތަށް އަނބުރާ ދާ',
    reset: 'ރީސެޓް',
    apply: 'ފިލްޓަރުތައް އެޕްލައިކުރޭ',
    showing: 'ދައްކަވަނީ',
    closed: 'ލައްޕާފައި',
    opened: 'ހުޅުވާފައި',
    summary: {
      context: 'މަގޭ އެޕްލިކޭޝަންތައް',
      open: 'އެޕްލިކޭޝަން ބަލާ',
      title: 'އެޕްލިކޭޝަންގެ މަޢުލޫމާތު',
      description: 'އެދުމުގެ ކުރު މަޢުލޫމާތު.',
      hint: 'އެޕްލިކޭޝަންތަކުގެ ލިސްޓުން ނުނިކުމެ އެދުމެއް ބައްލަވާ.',
      fields: [
        ['ޚިދުމަތް', 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން'],
        ['އެދުމުގެ ނަންބަރު', 'DEMO-1042'],
        ['އެދުނު ފަރާތް', 'އާމިނާ ޢަލީ'],
        ['ހާލަތު', 'ބަލަމުންދަނީ'],
      ],
    },
    filters: {
      context: 'ޚިދުމަތެއް ހޯދާ',
      open: 'ނަތީޖާ ފިލްޓަރުކުރޭ',
      title: 'ނަތީޖާ ފިލްޓަރުކުރުން',
      description: 'ހޯދުމުގައި ހިމަނަންވީ ބައިތައް ހޮވާ.',
      hint: 'ފިލްޓަރުތައް ހޮވައި ނަތީޖާތަކަށް އަނބުރާ ދާ.',
      label: 'ޚިދުމަތުގެ ބާވަތް',
      options: [
        { id: 'all', label: 'ހުރިހާ ބާވަތްތައް' },
        { id: 'immigration', label: 'އިމިގްރޭޝަން އަދި ބޯޑަރ ކޮންޓްރޯލް' },
        { id: 'employment', label: 'މަސައްކަތާއި ވަޒީފާ' },
        { id: 'digital', label: 'ޑިޖިޓަލް ސަރުކާރާއި ޓެކްނޮލޮޖީ' },
      ],
    },
    guide: {
      context: 'ވިޔަފާރި ރަޖިސްޓްރީކުރުން',
      open: 'ހުށަހެޅުމުގެ ކުރިން',
      title: 'ހުށަހެޅުމުގެ ކުރިން',
      description: 'އެދުން ފެށުމުގެ ކުރިން މަޢުލޫމާތު ތައްޔާރުކުރޭ.',
      hint: 'ޚިދުމަތުގެ ސަފްހާން ނުނިކުމެ އިރުޝާދު ކިޔާލައްވާ.',
      sections: [
        {
          title: 'އެދުން ހޮވާ',
          body: 'އާ ވިޔަފާރިއެއް ރަޖިސްޓްރީކުރަނީތޯ ނުވަތަ މިހާރުގެ ރެކޯޑެއް ބަދަލުކުރަނީތޯ ނިންމާ.',
          items: [
            'ރަނގަޅު ޚިދުމަތް ހޮވިފައިވޭތޯ ބަލާ.',
            'މިހާރުގެ ރަޖިސްޓްރީ ނަންބަރު ތައްޔާރުކުރޭ.',
          ],
        },
        {
          title: 'ލިޔެކިޔުންތައް ތައްޔާރުކުރޭ',
          body: 'ބޭނުންވާ ލިޔެކިޔުންތައް އެދުމާއި ގުޅެއެވެ. ފެށުމުގެ ކުރިން ލިޔެކިޔުންތަކުގެ ލިސްޓު ބަލާ.',
          items: [
            'ސާފު ކޮޕީތައް ބޭނުންކުރޭ.',
            'ލިޔެކިޔުންތަކުގައިވާ ނަންތަކާއި ނަންބަރުތައް އެއްގޮތްތޯ ބަލާ.',
          ],
        },
        {
          title: 'ހުށަހެޅުމުގެ ކުރިން ބަލާ',
          body: 'އެޕްލިކޭޝަން ހުށަހެޅުމުގެ ކުރިން ޖަވާބުތަކާއި އެޓޭޗްކުރި ލިޔެކިޔުންތައް ބަލާ.',
          items: [
            'ގުޅޭނެ މަޢުލޫމާތު ރަނގަޅުތޯ ބަލާ.',
            'ފަހުން ހޯދުމަށް އެދުމުގެ ނަންބަރު ބަހައްޓާ.',
          ],
        },
      ],
    },
  },
};

export function useSheetExampleCopy() {
  const { language } = useVeliLanguage();
  return sheetExampleCopy[language === 'dv' ? 'dv' : 'en'];
}

export function ApplicationSummary() {
  const text = useSheetExampleCopy();
  return (
    <div className="@container">
      <dl className="grid grid-cols-1 gap-x-8 gap-y-6 @xl:grid-cols-2">
        {text.summary.fields.map(([label, value]) => (
          <div key={label} className="flex min-w-0 flex-col gap-1">
            <dt className="type-body-sm-regular text-base-muted">{label}</dt>
            <dd className="type-body-md-medium text-base-strong">
              <bdi>{value}</bdi>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function PreparationGuide() {
  const text = useSheetExampleCopy();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      {text.guide.sections.map((section) => (
        <section key={section.title} className="flex flex-col gap-3">
          <h3 className="type-subtitle-semibold text-base-strong">{section.title}</h3>
          <p>{section.body}</p>
          <ul className="flex list-disc flex-col gap-2 ps-6">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
