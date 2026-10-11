import { useRef } from 'react';
import { Tooltip, TooltipTrigger, type TooltipProps } from './tooltip.js';
import { Button } from './button.js';

export function TooltipTypeExpectations() {
  const ref = useRef<HTMLDivElement>(null);
  const props: TooltipProps = {
    children: 'Help',
    size: 'lg',
    tone: 'secondary',
    placement: 'top start',
    offset: 0,
    crossOffset: 4,
    arrowBoundaryOffset: 20,
    shouldFlip: true,
    lang: 'dv',
    dir: 'rtl',
    className: ({ placement }) => (placement === 'top' ? 'mt-2' : ''),
  };
  return (
    <>
      <TooltipTrigger
        isOpen
        onOpenChange={(isOpen: boolean) => void isOpen}
        delay={500}
        closeDelay={100}
        trigger="focus"
      >
        <Button>Help</Button>
        <Tooltip {...props} ref={ref} />
      </TooltipTrigger>
      <TooltipTrigger isDisabled defaultOpen>
        <Button>Disabled</Button>
        <Tooltip>Help</Tooltip>
      </TooltipTrigger>
      {/* @ts-expect-error Only small and large sizes are supported */}
      <Tooltip size="md">Help</Tooltip>
      {/* @ts-expect-error Only primary and secondary tones are supported */}
      <Tooltip tone="danger">Help</Tooltip>
      {/* @ts-expect-error Tooltip children are content, not a render function */}
      <Tooltip>{() => 'Help'}</Tooltip>
    </>
  );
}
