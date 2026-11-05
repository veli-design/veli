import type { FilterBarValue, FilterCategory } from './types';

export function getFilterLabelIds(category: FilterCategory, value: FilterBarValue) {
  const selected = Object.prototype.hasOwnProperty.call(value.selections, category.id)
    ? value.selections[category.id]
    : undefined;
  return (
    category.children
      ?.filter((item) => selected === true || selected?.includes(item.id))
      .map((item) => item.id) ?? []
  );
}

/** Only known options participate; stale URL selections never produce phantom chips/counts. */
export function normalizeFilterValue(
  categories: readonly FilterCategory[],
  value: FilterBarValue,
): FilterBarValue {
  const categoryId = categories.some((category) => category.id === value.categoryId)
    ? value.categoryId
    : null;
  const selections: Record<string, true | readonly string[]> = Object.create(null);
  for (const category of categories) {
    if (category.children?.length) {
      const ids = getFilterLabelIds(category, value);
      if (ids.length) selections[category.id] = ids;
    } else if (value.selections[category.id] === true) selections[category.id] = true;
  }
  const ids = Object.keys(selections);
  return {
    ...value,
    categoryId: ids.length === 1 ? ids[0] : categoryId,
    selections,
    mode: ids.length > 1 ? 'advanced' : 'browse',
  };
}
