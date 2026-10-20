'use client';

import { useId } from 'react';
import { Button as AriaButton, DialogTrigger, Heading } from 'react-aria-components';
import {
  InfoIcon,
  XIcon,
  NumberCircleOneIcon,
  NumberCircleTwoIcon,
  NumberCircleThreeIcon,
  NumberCircleFourIcon,
} from '@phosphor-icons/react';
import type { ServiceApply, ServiceDetailProps } from './types';
import { DialogSurface } from './dialog-surface';

export function ApplyingInfoDialog({
  information,
  platform,
  labels,
  dialogClassName,
  overlayClassName,
}: {
  information: NonNullable<ServiceApply['information']>;
  platform: ServiceApply['platform'];
  labels: ServiceDetailProps['labels'];
  dialogClassName?: string;
  overlayClassName?: string;
}) {
  const descriptionId = useId();
  const numberIcons = [
    NumberCircleOneIcon,
    NumberCircleTwoIcon,
    NumberCircleThreeIcon,
    NumberCircleFourIcon,
  ];
  return (
    <DialogTrigger>
      <AriaButton className="veli-service-detail-platform-trigger" aria-describedby={descriptionId}>
        <span>{labels.applyOn}</span>
        {platform?.logo}
        <strong>{platform?.name ?? information.title}</strong>
        <InfoIcon
          aria-hidden
          weight="fill"
          className="veli-service-detail-small-icon veli-service-detail-platform-info-icon"
        />
      </AriaButton>
      <span id={descriptionId} className="veli-service-detail-sr-only">
        {information.title}
      </span>
      <DialogSurface dialogClassName={dialogClassName} overlayClassName={overlayClassName}>
        <div className="veli-service-detail-dialog-header">
          <Heading slot="title">{information.title}</Heading>
          <AriaButton
            slot="close"
            className="veli-service-detail-close-button"
            aria-label={labels.closeInformation}
          >
            <XIcon aria-hidden className="veli-service-detail-small-icon" />
          </AriaButton>
        </div>
        <ol className="veli-service-detail-steps">
          {information.steps.map((step, index) => {
            const NumberIcon = numberIcons[index];
            return (
              <li key={step.id} className="veli-service-detail-step">
                <span className="veli-service-detail-step-rail" aria-hidden>
                  <span className="veli-service-detail-step-number">
                    {NumberIcon ? (
                      <NumberIcon className="veli-service-detail-step-icon" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  {index < information.steps.length - 1 && (
                    <span className="veli-service-detail-step-connector" />
                  )}
                </span>
                <div className="veli-service-detail-step-content">
                  <h3 className="veli-service-detail-step-title">{step.title}</h3>
                  <p className="veli-service-detail-body-text">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </DialogSurface>
    </DialogTrigger>
  );
}
