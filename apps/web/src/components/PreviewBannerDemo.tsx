import { VeliProvider } from '@veli-design/react/provider';
import { PreviewBanner } from '@tradenetcorp/veli-blocks/preview-banner';

export function PreviewBannerDemo() {
  return (
    <VeliProvider language="en" colorScheme="light">
      <div
        className="bg-surface-raised relative h-[200px] overflow-hidden rounded-xl border border-border-base-muted"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 p-4">
            <p className="type-body-sm-regular text-text-base-muted">
              Floating preview banner with a scroll spacer. Exit uses a full document navigation in
              production.
            </p>
          </div>
          <PreviewBanner
            notices={[
              {
                id: 'draft-mode',
                title: 'Preview',
                message: 'Only editors can see this version.',
                previewStatus: 'draft',
                statusLabel: 'Draft',
                action: { href: '#', label: 'Exit preview' },
              },
            ]}
          />
        </div>
      </div>
    </VeliProvider>
  );
}
