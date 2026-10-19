import { FacebookLogoIcon, XLogoIcon, EnvelopeSimpleIcon, LinkIcon } from '@phosphor-icons/react';

/** Sample application data, deliberately outside the downloadable block. */
export function pageNavigationFooterContent(language: 'en' | 'dv') {
  const dv = language === 'dv';
  return {
    label: dv ? 'ސަފުޙާގެ ލިންކުތައް' : 'Page navigation',
    identity: {
      name: dv
        ? 'މިނިސްޓްރީ އޮފް ފިނޭންސް އެންޑް ޕަބްލިކް އެންޓަޕްރައިސަސް'
        : 'Ministry of Finance and Public Enterprises',
      description: dv
        ? 'މިނިސްޓްރީ އޮފް ފިނޭންސް އެންޑް ޕަބްލިކް އެންޓަޕްރައިސަސް\nއަމީނީ މަގު، ބްލޮކް 379، މާލެ،\nދިވެހިރާއްޖެ'
        : 'Ministry of Finance and Public Enterprises\nAmeenee Magu, Block 379, Male’,\nRepublic of Maldives',
    },
    internalLinks: [
      { id: 'about', label: dv ? 'ތަޢާރަފް' : 'About', href: '/about' },
      { id: 'media', label: dv ? 'މީޑިއާ' : 'Media', href: '/about#media' },
      { id: 'services', label: dv ? 'ޚިދުމަތްތައް' : 'Services', href: '/about#services' },
      { id: 'contact', label: dv ? 'ގުޅުއްވާ' : 'Contact', href: '/about#contact' },
    ],
    externalLinks: [
      {
        id: 'tenders',
        label: dv ? 'ނޭޝަނަލް ޓެންޑަރ ބޯޑު' : 'National Tender Board',
        href: 'https://www.finance.gov.mv/',
      },
      {
        id: 'procurement',
        label: dv ? 'ޕްރޮކިއުމަންޓް ޕޯޓަލް' : 'Procurement Portal',
        href: 'https://www.finance.gov.mv/',
      },
      {
        id: 'pay',
        label: dv ? 'ނޭޝަނަލް ޕޭ ކޮމިޝަން' : 'National Pay Commission',
        href: 'https://www.finance.gov.mv/',
      },
      {
        id: 'finance',
        label: dv ? 'ޢާންމު މާލިއްޔަތު' : 'Public Finance',
        href: 'https://www.finance.gov.mv/',
      },
      {
        id: 'budget',
        label: dv ? 'ޤައުމީ ބަޖެޓް' : 'National Budget',
        href: 'https://www.finance.gov.mv/',
      },
      {
        id: 'public-procurement',
        label: dv ? 'ސަރުކާރުގެ ހޯދުންތައް' : 'Public Procurement',
        href: 'https://www.finance.gov.mv/',
      },
    ],
    socialLabel: dv ? 'ގުޅުއްވާ' : 'Social and contact links',
    socialLinks: [
      {
        id: 'facebook',
        label: 'Facebook',
        href: 'https://www.facebook.com/',
        icon: <FacebookLogoIcon weight="bold" size={16} />,
      },
      { id: 'x', label: 'X', href: 'https://x.com/', icon: <XLogoIcon weight="bold" size={16} /> },
      {
        id: 'email',
        label: dv ? 'އީމެއިލް' : 'Email',
        href: 'mailto:hello@example.test',
        icon: <EnvelopeSimpleIcon weight="bold" size={16} />,
      },
      {
        id: 'website',
        label: dv ? 'ވެބްސައިޓް' : 'Website',
        href: 'https://www.finance.gov.mv/',
        icon: <LinkIcon weight="bold" size={16} />,
      },
    ],
  };
}
