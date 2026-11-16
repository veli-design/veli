import { useState } from 'react';
import { Focusable } from 'react-aria-components';
import { Tooltip, TooltipTrigger } from '@veli-design/react/tooltip';

export function FigmaLibraryPlaceholder() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Focusable>
        <button
          type="button"
          className="get-started-resource"
          aria-disabled="true"
          aria-label="Figma library: Coming soon"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
        >
          <img src="/images/get-started/0d37a.svg" width="20" height="20" alt="" />
          <span>Figma library</span>
          <img src="/images/get-started/f6735.svg" width="20" height="20" alt="" />
        </button>
      </Focusable>
      <Tooltip placement="top">Coming soon</Tooltip>
    </TooltipTrigger>
  );
}
