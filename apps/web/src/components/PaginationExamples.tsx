import { useState } from 'react';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { VeliProvider } from '@veli-design/react/provider';
import { Pagination } from '@veli-design/react/pagination';

export function PaginationUsageDemo() {
  const [page, setPage] = useState(1);
  return <Pagination value={page} maxValue={8} onChange={setPage} variant="button" />;
}

export function PaginationVariantsDemo() {
  const [page, setPage] = useState(3);
  return (
    <Pagination value={page} maxValue={12} onChange={setPage} variant="explicit" siblingCount={1} />
  );
}

export function PaginationLoadMoreDemo() {
  const [loadedCount, setLoadedCount] = useState(12);
  const [isLoading, setLoading] = useState(false);
  return (
    <Pagination
      variant="loadmore"
      loadedCount={loadedCount}
      totalCount={42}
      isLoading={isLoading}
      onLoadMore={async () => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setLoadedCount((count) => Math.min(count + 12, 42));
        setLoading(false);
      }}
    />
  );
}

export function PaginationRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const [variant, setVariant] = useState('Explicit');

  return (
    <DocsPreview
      codeKey={`pagination-${language === 'Dhivehi' ? 'dv' : 'en'}-${variant === 'Load more' ? 'loadmore' : variant === 'Explicit' ? 'explicit' : 'button'}`}
      controls={
        <>
          <DocsPreviewOption
            label="Language"
            value={language}
            options={['English', 'Dhivehi']}
            onChange={setLanguage}
          />
          <DocsPreviewOption
            label="Variant"
            value={variant}
            options={['Button', 'Explicit', 'Load more']}
            onChange={setVariant}
          />
        </>
      }
    >
      <VeliProvider
        language={language === 'Dhivehi' ? 'dv' : 'en'}
        className="flex w-full min-w-0 justify-center"
      >
        {variant === 'Load more' ? (
          <PaginationLoadMoreDemo />
        ) : (
          <Pagination
            variant={variant === 'Explicit' ? 'explicit' : 'button'}
            defaultValue={3}
            maxValue={12}
          />
        )}
      </VeliProvider>
    </DocsPreview>
  );
}
