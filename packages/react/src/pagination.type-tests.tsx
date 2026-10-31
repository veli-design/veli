import {
  Pagination,
  type PaginationPageProps,
  type PaginationLoadMoreProps,
} from './pagination.js';

export function PaginationTypeExpectations() {
  const pageProps: PaginationPageProps = { maxValue: 12 };
  const loadMoreProps: PaginationLoadMoreProps = {
    variant: 'loadmore',
    loadedCount: 12,
    totalCount: 42,
    onLoadMore: () => {},
  };

  return (
    <>
      <Pagination {...pageProps} />
      <Pagination {...loadMoreProps} />
      {/* @ts-expect-error Pagination does not expose a global disabled state */}
      <Pagination maxValue={12} isDisabled />
      {/* @ts-expect-error page navigation requires maxValue */}
      <Pagination variant="explicit" />
      {/* @ts-expect-error load more requires an item total */}
      <Pagination variant="loadmore" loadedCount={12} onLoadMore={() => {}} />
      {/* @ts-expect-error load more requires an action */}
      <Pagination variant="loadmore" loadedCount={12} totalCount={42} />
      {/* @ts-expect-error item counts do not belong to page navigation */}
      <Pagination variant="explicit" maxValue={12} loadedCount={12} />
      {/* @ts-expect-error page counts do not belong to load more */}
      <Pagination {...loadMoreProps} maxValue={12} />
    </>
  );
}
