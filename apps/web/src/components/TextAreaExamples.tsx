import { TextArea } from '@veli-design/react/textarea';

export function TextAreaUsageDemo() {
  return (
    <div className="w-[360px]">
      <TextArea
        label="Message"
        isOptional
        placeholder="Tell us how we can help"
        description="Helper text"
        maxLength={280}
      />
    </div>
  );
}

export function TextAreaAppearancesDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextArea label="Default" placeholder="Write a note" />
      <TextArea appearance="outline" label="Outline" placeholder="Write a note" />
    </div>
  );
}

export function TextAreaValidationDemo() {
  return (
    <div className="w-[360px]">
      <TextArea
        label="Details"
        placeholder="Enter details"
        isInvalid
        errorMessage="This field needs attention."
      />
    </div>
  );
}
