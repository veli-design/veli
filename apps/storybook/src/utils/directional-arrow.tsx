import type { ComponentProps } from 'react';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react';

export function DirectionalArrow(props: ComponentProps<typeof ArrowRightIcon>) {
  const { direction } = useVeliLanguage();
  const ArrowIcon = direction === 'rtl' ? ArrowLeftIcon : ArrowRightIcon;

  return <ArrowIcon {...props} />;
}
