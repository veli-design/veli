import { Select, SelectItem, SelectSection } from '@veli-design/react/select';

export function SelectUsageDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Country" isOptional placeholder="Choose a country" description="Helper text">
        <SelectItem id="my">Malaysia</SelectItem>
        <SelectItem id="sg">Singapore</SelectItem>
        <SelectItem id="th">Thailand</SelectItem>
      </Select>
    </div>
  );
}

export function SelectAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Select label="Default" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select appearance="outline" label="Outline" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
    </div>
  );
}

export function SelectSectionsDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Island" placeholder="Choose an island">
        <SelectSection title="Popular">
          <SelectItem id="male" description="Capital city">
            Male&apos;
          </SelectItem>
          <SelectItem id="hulhumale" description="Reclaimed island">
            Hulhumale&apos;
          </SelectItem>
        </SelectSection>
        <SelectSection title="Regional">
          <SelectItem id="addu">Addu City</SelectItem>
          <SelectItem id="fuvahmulah" isDisabled>
            Fuvahmulah City
          </SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}

export function SelectValidationDemo() {
  return (
    <div className="w-[320px]">
      <Select label="Status" isInvalid errorMessage="Choose a status to continue.">
        <SelectItem id="active">Active</SelectItem>
        <SelectItem id="inactive">Inactive</SelectItem>
      </Select>
    </div>
  );
}
