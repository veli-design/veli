'use client';

import { Card } from '@veli-design/react/card';
import { VeliProvider } from '@veli-design/react/provider';

export function Services() {
  return (
    <VeliProvider language={'dv'} colorScheme="system">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Permits</Card.Title>
          </Card.Header>
        </Card>
        <Card>
          <Card.Header>
            <Card.Title>Registrations</Card.Title>
          </Card.Header>
        </Card>
      </div>
    </VeliProvider>
  );
}
