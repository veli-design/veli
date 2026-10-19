import ErrorExample from './example';

export default async function ErrorExamplePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return <ErrorExample initial={await searchParams} />;
}
