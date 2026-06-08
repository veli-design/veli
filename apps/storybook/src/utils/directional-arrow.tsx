import type { ComponentProps } from 'react';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { ArrowLeft, ArrowRight } from 'phosphor-react';

export function DirectionalArrow(props: ComponentProps<typeof ArrowRight>) {
  const { direction } = useVeliLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeft : ArrowRight;

  return <ArrowIcon {...props} />;
}
