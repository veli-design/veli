// Application-owned sample copy for the error-page example.
// Adapt these messages and accessibility labels to your product.

export const ERROR_KINDS = ['404', '500', '503', '403', '401', 'offline'] as const;
export type ErrorKind = (typeof ERROR_KINDS)[number];

type ErrorCopy = {
  title: string;
  description: string;
  detail: string;
  reportPrompt?: string;
  reportLabel?: string;
};

type ErrorDictionary = {
  search: string;
  home: string;
  retry: string;
  signIn: string;
  signInAgain: string;
  or: string;
  changeStyle: string;
  pages: Record<ErrorKind, ErrorCopy>;
};

const en: ErrorDictionary = {
  search: 'Search',
  home: 'Return home',
  retry: 'Try again',
  signIn: 'Sign in',
  signInAgain: 'Sign in again',
  or: 'or',
  changeStyle: 'Artwork. Activate to change its style.',
  pages: {
    '404': {
      title: 'Page not found',
      description: 'The page you are looking for does not exist.',
      detail: 'Error: 404',
      reportPrompt: 'Followed a link to get here?',
      reportLabel: 'Report a broken link',
    },
    '500': {
      title: 'Something went wrong',
      description: 'There is a problem on our side. Please try again in a few minutes.',
      detail: 'Error: 500',
      reportPrompt: 'Still not working?',
      reportLabel: 'Report a problem',
    },
    '503': {
      title: 'Down for maintenance',
      description: 'We are updating this service. Please try again later.',
      detail: 'Error: 503',
      reportPrompt: 'Need help now?',
      reportLabel: 'Contact us',
    },
    '403': {
      title: 'You don’t have access',
      description:
        'You need permission to view this page.\nSign in with an account that has access.',
      detail: 'Error: 403',
      reportPrompt: 'Think you should have access?',
      reportLabel: 'Contact us',
    },
    '401': {
      title: 'Your session has expired',
      description: 'For your security, you were signed out after a period of inactivity.',
      detail: 'Error: 401',
    },
    offline: {
      title: 'You’re offline',
      description: 'Check your internet connection, then try again.',
      detail: 'No internet connection',
    },
  },
};

const dv: ErrorDictionary = {
  search: 'ހޯއްދަވާ',
  home: 'މައި ސަފުޙާއަށް',
  retry: 'އަލުން މަސައްކަތްކުރައްވާ',
  signIn: 'ސައިން އިން ކުރައްވާ',
  signInAgain: 'އަލުން ސައިން އިން ކުރައްވާ',
  or: 'ނުވަތަ',
  changeStyle: 'ކުރެހުން. ސްޓައިލް ބަދަލުކުރުމަށް ފިއްތާލާ.',
  pages: {
    '404': {
      title: 'ސަފުޙާ ނުފެނުނު',
      description: 'ތިޔަ ހޯއްދަވާ ސަފުޙާއެއް ނެތް.',
      detail: 'އެރަރ: 404',
      reportPrompt: 'ލިންކެއް މެދުވެރިކޮށްތޯ މިސަފުޙާއަށް އާދެވުނީ؟',
      reportLabel: 'ބްރޯކެން ލިންކެއް ރިޕޯޓުކުރައްވާ',
    },
    '500': {
      title: 'މައްސަލައެއް ދިމާވެއްޖެ',
      description:
        'އަޅުގަނޑުމެންގެ ފަރާތުން މައްސަލައެއް ދިމާވެއްޖެ. މިނެޓު ކިހިނެއްގެ ފަހުން އަލުން މަސައްކަތް ކުރައްވާ.',
      detail: 'އެރަރ: 500',
      reportPrompt: 'އަދިވެސް ނުހިނގަނީތޯ؟',
      reportLabel: 'މައްސަލައެއް ރިޕޯޓުކުރައްވާ',
    },
    '503': {
      title: 'މެއިންޓެނަންސްގެ މަސައްކަތެއް ކުރަމުން ދަނީ',
      description: 'މި ޚިދުމަތް އަޕްޑޭޓްކުރަމުން ދަނީ. ފަހުން އަލުން މަސައްކަތް ކުރައްވާ.',
      detail: 'އެރަރ: 503',
      reportPrompt: 'މިހާރު އެހީއަށް ބޭނުންތޯ؟',
      reportLabel: 'އަޅުގަނޑުމެންނާ ގުޅުއްވާ',
    },
    '403': {
      title: 'މި ސަފުޙާ ބެއްލެވުމުގެ ހުއްދައެއް ނެތް',
      description:
        'މި ސަފުޙާ ބެއްލެވުމަށް ހުއްދަ ލިބިފައި ހުންނަން ޖެހޭނެއެވެ.\nހުއްދަ ލިބިފައިވާ އެކައުންޓަކުން ސައިން އިން ކުރައްވާ.',
      detail: 'އެރަރ: 403',
      reportPrompt: 'ހުއްދަ ލިބެން ޖެހޭ ކަމަށް ހީވަނީތޯ؟',
      reportLabel: 'އަޅުގަނޑުމެންނާ ގުޅުއްވާ',
    },
    '401': {
      title: 'ތިޔަ ސެޝަން ހަމަވެއްޖެ',
      description:
        'ތިޔަބޭފުޅާގެ ރައްކާތެރިކަމަށްޓަކައި، ކަމެއް ނުކުރައްވާ ދުވަސްވީތީ ސައިން އައުޓް ކުރެވިއްޖެ.',
      detail: 'އެރަރ: 401',
    },
    offline: {
      title: 'އިންޓަރނެޓާ ގުޅިފައެއް ނުވޭ',
      description: 'އިންޓަރނެޓް ކަނެކްޝަން ޗެކްކުރައްވާފައި، އަލުން މަސައްކަތް ކުރައްވާ.',
      detail: 'އިންޓަރނެޓް ކަނެކްޝަނެއް ނެތް',
    },
  },
};

export const errorPageMessages = { en, dv };
