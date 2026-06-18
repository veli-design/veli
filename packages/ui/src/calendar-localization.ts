export const dhivehiCalendarText = {
  today: 'މިއަދު',
  months: {
    january: 'ޖަނަވަރީ',
    february: 'ފެބްރުއަރީ',
    march: 'މާރިޗު',
    april: 'އެޕްރީލް',
    may: 'މެއި',
    june: 'ޖޫން',
    july: 'ޖުލައި',
    august: 'އޮގަސްޓު',
    september: 'ސެޕްޓެމްބަރު',
    october: 'އޮކްޓޯބަރު',
    november: 'ނޮވެމްބަރު',
    december: 'ޑިސެމްބަރު',
  },
  weekdaysNarrow: {
    sunday: 'އދ',
    monday: 'ހމ',
    tuesday: 'އނ',
    wednesday: 'ބދ',
    thursday: 'ބރ',
    friday: 'ހކ',
    saturday: 'ހނ',
  },
  weekdaysShort: {
    sunday: 'އާދީ',
    monday: 'ހޯމަ',
    tuesday: 'އަން',
    wednesday: 'ބުދަ',
    thursday: 'ބުރާސް',
    friday: 'ހުކުރު',
    saturday: 'ހޮނި',
  },
  weekdaysFull: {
    sunday: 'އާދީއްތަ',
    monday: 'ހޯމަ',
    tuesday: 'އަންގާރަ',
    wednesday: 'ބުދަ',
    thursday: 'ބުރާސްފަތި',
    friday: 'ހުކުރު',
    saturday: 'ހޮނިހިރު',
  },
} as const;

const englishCalendarText = {
  today: 'Today',
} as const;

const monthKeys = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

const weekdayAliases = {
  sun: 'sunday',
  sunday: 'sunday',
  mon: 'monday',
  monday: 'monday',
  tue: 'tuesday',
  tues: 'tuesday',
  tuesday: 'tuesday',
  wed: 'wednesday',
  wednesday: 'wednesday',
  thu: 'thursday',
  thur: 'thursday',
  thurs: 'thursday',
  thursday: 'thursday',
  fri: 'friday',
  friday: 'friday',
  sat: 'saturday',
  saturday: 'saturday',
} as const;

type MonthKey = (typeof monthKeys)[number];
type WeekdayKey = keyof typeof dhivehiCalendarText.weekdaysFull;
type CalendarLanguage = 'en' | 'dv';

export function getCalendarTodayLabel(language: CalendarLanguage) {
  return language === 'dv' ? dhivehiCalendarText.today : englishCalendarText.today;
}

export function getDhivehiMonthName(month: number) {
  const monthKey = monthKeys[month - 1] as MonthKey | undefined;

  return monthKey ? dhivehiCalendarText.months[monthKey] : '';
}

export function getDhivehiWeekdayLabel(day: string, weekdayStyle: 'narrow' | 'short' | 'long') {
  const weekdayKey = weekdayAliases[day.toLowerCase() as keyof typeof weekdayAliases];

  if (!weekdayKey) {
    return day;
  }

  if (weekdayStyle === 'narrow') {
    return dhivehiCalendarText.weekdaysNarrow[weekdayKey as WeekdayKey];
  }

  if (weekdayStyle === 'long') {
    return dhivehiCalendarText.weekdaysFull[weekdayKey as WeekdayKey];
  }

  return dhivehiCalendarText.weekdaysShort[weekdayKey as WeekdayKey];
}
