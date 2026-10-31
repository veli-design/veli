import { Card, CardDescription, CardHeader, CardTitle } from '@veli-design/react/card';
import { Link } from '@veli-design/react/link';

const services = [
  { slug: 'permits', title: 'Permits', description: 'Apply for and renew permits.' },
  { slug: 'registrations', title: 'Registrations', description: 'Register a business or vehicle.' },
  { slug: 'licences', title: 'Licences', description: 'Manage professional licences.' },
];

export function ServiceDirectory() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {services.map((service) => (
        <li key={service.slug}>
          <Card>
            <CardHeader>
              <CardTitle>
                <Link href={`/services/${service.slug}`}>{service.title}</Link>
              </CardTitle>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
}
