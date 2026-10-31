import { SiteFooter } from '@tradenetcorp/veli-blocks/site-footer';
import { VeliProvider } from '@veli-design/react/provider';

export function SiteFooterDemo() {
  return (
    <VeliProvider language="en" colorScheme="light">
      <div className="bg-surface-raised rounded-xl border border-border-base-muted">
        <SiteFooter
          startLabel="Service information"
          endLabel="Policies"
          startLinks={[
            { id: 'about', label: 'About', href: '#ownership-and-prerequisites' },
            { id: 'roadmap', label: 'Roadmap', href: '#changelog' },
          ]}
          endLinks={[
            { id: 'privacy', label: 'Privacy', href: '#accessibility-and-responsive-behavior' },
            { id: 'terms', label: 'Terms of use', href: '#ownership-and-prerequisites' },
          ]}
        />
      </div>
    </VeliProvider>
  );
}
