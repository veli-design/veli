import type { ReactNode } from 'react';
import { MenuItem } from '@tradenetcorp/veli-ui/menu';
import { Button, Menu, MenuTrigger, Popover } from 'react-aria-components';
import { CaretDown } from 'phosphor-react';
import styles from './DocsPreview.module.css';

export function DocsPreview({
  controls,
  children,
  codeKey,
}: {
  controls: ReactNode;
  children: ReactNode;
  codeKey: string;
}) {
  return (
    <div className={styles.preview} data-docs-preview="options" data-docs-preview-code={codeKey}>
      <div className={styles.canvas}>
        <div className={styles.controls}>{controls}</div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}

export function DocsPreviewOption({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}) {
  return (
    <MenuTrigger>
      <Button className={styles.trigger} aria-label={`${label}: ${value}`}>
        {value}
        <CaretDown size={16} aria-hidden="true" />
      </Button>
      <Popover className={styles.popover} placement="bottom end" offset={4}>
        <Menu aria-label={label} className="outline-none" onAction={(key) => onChange(String(key))}>
          {options.map((option) => (
            <MenuItem key={option} id={option} size="sm" className="px-4">
              {option}
            </MenuItem>
          ))}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
