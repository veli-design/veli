import { Avatar } from '@veli-design/react/avatar';

export function AvatarUsageDemo() {
  return (
    <Avatar type="initials" initials="Aishath Mariyam" appearance="blue" alt="Aishath Mariyam" />
  );
}

export function AvatarTypesDemo() {
  return (
    <div className="flex flex-wrap items-center gap-[16px]">
      <Avatar
        type="image"
        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80"
        alt="Aishath Mariyam"
      />
      <Avatar type="initials" initials="Aishath Mariyam" appearance="blue" alt="Aishath Mariyam" />
      <Avatar type="icon" appearance="neutral" alt="User" />
      <Avatar type="agencyIcon" appearance="emerald" alt="Agency" />
    </div>
  );
}

export function AvatarAppearancesDemo() {
  const appearances = [
    'blue',
    'neutral',
    'emerald',
    'yellow',
    'orange',
    'magenta',
    'indigo',
    'teal',
    'green',
    'lime',
  ] as const;

  return (
    <div className="flex flex-wrap items-center gap-[12px]">
      {appearances.map((appearance) => (
        <Avatar
          key={appearance}
          type="initials"
          initials="MV"
          appearance={appearance}
          alt={appearance}
        />
      ))}
    </div>
  );
}

export function AvatarSizesDemo() {
  const sizes = ['60', '52', '44', '36', '28', '20', '16'] as const;

  return (
    <div className="flex flex-wrap items-end gap-[12px]">
      {sizes.map((size) => (
        <Avatar key={size} type="icon" appearance="blue" size={size} alt="User" />
      ))}
    </div>
  );
}
