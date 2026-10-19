import { Card, CardDescription, CardHeader, CardTitle } from '@tradenetcorp/veli-ui/card';
import { Link } from '@tradenetcorp/veli-ui/link';

const services = ['permits', 'registrations', 'licences'];

export function ServiceDirectory() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {services.map((slug) => (
        <Card key={slug} interactive onClick={() => (window.location.href = `/services/${slug}`)}>
          <CardHeader>
            <CardTitle>{slug}</CardTitle>
            <CardDescription>Open the {slug} service.</CardDescription>
          </CardHeader>
        </Card>
      ))}
      <Link href="/services">All services</Link>
    </div>
  );
}
