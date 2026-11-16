import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { Form } from '@veli-design/react/form';
import { Search } from '@veli-design/react/search';

export function SearchUsageDemo() {
  return (
    <div className="w-[320px] max-w-full">
      <Search aria-label="Search services" placeholder="Search services" />
    </div>
  );
}

export function SearchAppearancesDemo() {
  return (
    <div className="grid w-full max-w-[320px] gap-4">
      <Search aria-label="Default search" placeholder="Default" />
      <Search aria-label="Outline search" appearance="outline" placeholder="Outline" />
      <Search aria-label="Small search" size="sm" placeholder="Small" />
      <Search aria-label="Large search" size="lg" placeholder="Large" />
    </div>
  );
}

export function SearchControlledDemo() {
  const [query, setQuery] = useState('');
  return (
    <div className="w-[320px] max-w-full space-y-3">
      <Search
        appearance="outline"
        label="Search services"
        value={query}
        onChange={setQuery}
        description="Filter services as you type."
      />
      <p className="type-body-sm-regular text-base-muted">Query: {query || 'None'}</p>
    </div>
  );
}

export function SearchValidationDemo() {
  return (
    <div className="w-[320px] max-w-full space-y-4">
      <Search label="Search services" description="Search by service name" />
      <Search
        appearance="outline"
        label="Invalid search"
        isInvalid
        errorMessage="Enter a more specific query."
      />
      <Search aria-label="Disabled search" defaultValue="Unavailable" isDisabled />
      <Search aria-label="Read-only search" defaultValue="Saved query" isReadOnly />
    </div>
  );
}

export function SearchFormDemo() {
  const [submitted, setSubmitted] = useState('');
  return (
    <Form
      className="w-[320px] max-w-full"
      validationBehavior="native"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(String(new FormData(event.currentTarget).get('query')));
      }}
    >
      <Search
        label="Find a service"
        name="query"
        isRequired
        pattern="[A-Za-z ]+"
        description="Enter a service name using letters and spaces."
        errorMessage="Enter a service name using letters and spaces."
      />
      <div className="flex gap-3">
        <Button type="submit">Search</Button>
        <Button type="reset" appearance="ghost" onPress={() => setSubmitted('')}>
          Reset
        </Button>
      </div>
      <p className="type-body-sm-regular text-base-muted" role="status">
        {submitted ? `Submitted query: ${submitted}` : 'No query submitted.'}
      </p>
    </Form>
  );
}

export function SearchEventsDemo() {
  const [submitted, setSubmitted] = useState('');
  return (
    <div className="w-[320px] max-w-full space-y-3">
      <Search
        aria-label="Search documents"
        placeholder="Search documents"
        onSubmit={setSubmitted}
        onClear={() => setSubmitted('')}
      />
      <p className="type-body-sm-regular text-base-muted" role="status">
        {submitted
          ? `Requested query: ${submitted}`
          : 'Press Enter to request a search; Escape clears the query.'}
      </p>
    </div>
  );
}
