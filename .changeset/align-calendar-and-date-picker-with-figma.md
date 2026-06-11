---
'@tradenetcorp/veli-ui': patch
---

Align Calendar and DatePicker with Figma: refresh calendar styling with dedicated calendar design tokens, add month/year header controls with a year picker dropdown, optional Today button (`showTodayButton`, `todayButtonLabel`), today-dot indicator, and a new `RangeCalendar` export with range-selection styling. Rework DatePicker to use a field trigger button that displays a formatted value (`placeholder`, `variant`, `size`, `granularity`, `hourCycle`) instead of inline date segments; remove `calendarButtonLabel`. Add shared field trigger/header utilities and `formatDatePickerValue` for consistent date display.
