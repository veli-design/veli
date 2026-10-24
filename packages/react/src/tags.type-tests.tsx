import { Tag, TagGroup, type TagSize } from './tags.js';

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
