'use client';

import NextLink from 'next/link';
import { ServiceDetail } from '../components/blocks/service-detail/service-detail';
import { serviceDetailContent } from './service-detail-content';

/** Mount inside the app's existing VeliProvider; replace fixture facts with mapped DTOs. */
export function ApplicationServiceDetail({ language = 'en' }: { language?: 'en' | 'dv' }) {
  return (
    <ServiceDetail
      {...serviceDetailContent(language)}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    />
  );
}
