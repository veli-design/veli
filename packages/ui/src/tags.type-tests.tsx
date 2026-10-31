import {
  Tag,
  TagGroup,
  TagButton,
  TagDropdown,
  type TagSize,
  type TagButtonProps,
} from './tags.js';

import { MenuItem } from './menu.js';
import { createRef } from 'react';

const buttonRef = createRef<HTMLButtonElement>();
const anchorRef = createRef<HTMLAnchorElement>();
const navigation: TagButtonProps<'a'> = { as: 'a', href: '/guide', ref: anchorRef };
void navigation;

const sizes: TagSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
void sizes;

export function TagsTypeExpectations() {
  return (
    <>
      <TagGroup<{ id: number; label: string }>
        label={0}
        items={[{ id: 0, label: 'Zero' }]}
        size="md"
        selectionMode="multiple"
        selectedKeys={new Set([0])}
        onSelectionChange={() => {}}
        onRemove={() => {}}
        listClassName="gap-3"
        renderEmptyState={(state) => <p>{state.isEmpty ? 'Empty' : 'Available'}</p>}
      >
        {(item) => (
          <Tag id={item.id} textValue={item.label} removeButtonLabel={(label) => `Remove ${label}`}>
            {(state) => <span>{state.isSelected ? 'Selected' : item.label}</span>}
          </Tag>
        )}
      </TagGroup>
      <TagGroup aria-label="Links" isDisabled disabledKeys={['guide']}>
        <Tag id="guide" href="/guide" target="_blank" rel="noreferrer" size="xl" leading="•">
          Guide
        </Tag>
      </TagGroup>
      <TagButton
        isSelected={false}
        onPress={() => {}}
        ref={(node) => {
          node?.focus();
        }}
      >
        Select
      </TagButton>
      <TagButton
        as="a"
        href="/guide"
        target="_blank"
        ref={(node) => {
          node?.focus();
        }}
      >
        Guide
      </TagButton>
      <TagDropdown
        isSelected={false}
        onSelect={() => {}}
        label="Tourism"
        appearance="outline"
        items={[{ id: 0, label: 'Zero' }]}
        defaultSelectedKeys={[0]}
        onDeselect={() => {}}
        renderSelection={(keys) => (keys === 'all' ? 'All' : keys.size)}
      >
        {(item) => <MenuItem id={item.id}>{item.label}</MenuItem>}
      </TagDropdown>
      {/* @ts-expect-error Action tags do not accept navigation destinations. */}
      <TagButton href="/guide">Guide</TagButton>
      {/* @ts-expect-error Navigation tags cannot be selected. */}
      <TagButton as="a" href="/guide" isSelected>
        Guide
      </TagButton>
      <TagButton ref={buttonRef} type="submit">
        Submit
      </TagButton>
      <TagButton as="a" href="/guide" ref={anchorRef} download>
        Download
      </TagButton>
      <TagButton
        as="a"
        render={(props) => (
          <a {...props} href="/router">
            {props.children}
          </a>
        )}
      >
        Router
      </TagButton>
      {/* @ts-expect-error Navigation requires href or an explicit router renderer. */}
      <TagButton as="a">Missing destination</TagButton>
      {/* @ts-expect-error Navigation cannot submit a form. */}
      <TagButton as="a" href="/guide" type="submit">
        Guide
      </TagButton>
      {/* @ts-expect-error Navigation has no form association. */}
      <TagButton as="a" href="/guide" form="form">
        Guide
      </TagButton>
      {/* @ts-expect-error Navigation has no button pending state. */}
      <TagButton as="a" href="/guide" isPending>
        Guide
      </TagButton>
      {/* @ts-expect-error Navigation cannot expose toggle selection. */}
      <TagButton as="a" href="/guide" aria-pressed>
        Guide
      </TagButton>
      {/* @ts-expect-error Navigation uses useLink, which does not support onPressUp. */}
      <TagButton as="a" href="/guide" onPressUp={() => {}}>
        Guide
      </TagButton>
      {/* @ts-expect-error Navigation uses useLink, which does not support onPressChange. */}
      <TagButton as="a" href="/guide" onPressChange={() => {}}>
        Guide
      </TagButton>
      {/* @ts-expect-error Action refs point to buttons. */}
      <TagButton ref={anchorRef}>Action</TagButton>
      {/* @ts-expect-error Navigation refs point to anchors. */}
      <TagButton as="a" href="/guide" ref={buttonRef}>
        Guide
      </TagButton>
      {/* @ts-expect-error Tags retain their five named sizes. */}
      <Tag id="invalid" size="xxl">
        Invalid
      </Tag>
      {/* @ts-expect-error Remove labels resolve to strings. */}
      <Tag id="invalid-label" removeButtonLabel={() => 0}>
        Invalid
      </Tag>
    </>
  );
}
