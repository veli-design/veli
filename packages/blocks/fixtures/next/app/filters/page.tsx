import { ApplicationFilterBar } from '../../filter-bar-adapter';

export default function FiltersPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="type-display-md-medium">Publications</h1>
      <ApplicationFilterBar />
    </main>
  );
}
