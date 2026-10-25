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
      <Tooltip size="sm">Neutral help</Tooltip>
      <Tooltip size="lg">Primary help</Tooltip>
      <Tooltip size="lg" tone="primary">
        Primary help
      </Tooltip>
      {/* @ts-expect-error Small tooltips have no tone variants */}
      <Tooltip size="sm" tone="primary">
        Help
      </Tooltip>
      {/* @ts-expect-error Small tooltips have no tone variants */}
      <Tooltip size="sm" tone="secondary">
        Help
      </Tooltip>
      {/* @ts-expect-error Omitted size defaults to small, which has no tone */}
      <Tooltip tone="secondary">Help</Tooltip>
      {/* @ts-expect-error Null size also defaults to small */}
      <Tooltip size={null} tone="primary">
        Help
      </Tooltip>
      {/* @ts-expect-error Only small and large sizes are supported */}
      <Tooltip size="md">Help</Tooltip>
      {/* @ts-expect-error Only primary and secondary tones are supported */}
      <Tooltip tone="danger">Help</Tooltip>
      {/* @ts-expect-error Tooltip children are content, not a render function */}
      <Tooltip>{() => 'Help'}</Tooltip>
    </>
  );
}
