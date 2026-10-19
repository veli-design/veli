'use client';

import { Card } from '@tradenetcorp/veli-ui/card';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

const services = [
  { id: 'permits', title: 'ހުއްދަތައް', description: 'ހުއްދައަކަށް އެދި ހުށަހެޅުމަށް' },
  { id: 'registrations', title: 'ރަޖިސްޓަރީ', description: 'ރަޖިސްޓަރީ ކުރުމާއި އައުކުރުމަށް' },
];

export function DhivehiServiceGrid() {
  return (
    <VeliProvider language="dv" colorScheme="system">
      <section aria-labelledby="services-heading">
        <h2 id="services-heading" className="type-heading-sm-semibold text-base-strong">
          ޚިދުމަތްތައް
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <Card.Header>
                <Card.Title>{service.title}</Card.Title>
                <Card.Description>{service.description}</Card.Description>
              </Card.Header>
            </Card>
          ))}
        </div>
      </section>
    </VeliProvider>
  );
}
