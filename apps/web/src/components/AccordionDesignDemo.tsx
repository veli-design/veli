import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from '@veli-design/react/accordion';
import { VeliProvider } from '@veli-design/react/provider';

interface Props {
  size?: 'md' | 'lg';
  alignment?: 'left' | 'right';
  flushed?: boolean;
  language?: 'en' | 'dv';
  state?: 'default' | 'hover' | 'pressed' | 'focus';
}

// Real Veli components keep the design examples useful with a keyboard and
// ensure their behavior stays aligned with the public API.
export default function AccordionDesignDemo({
  size = 'lg',
  alignment = 'left',
  flushed = false,
  language = 'en',
  state,
}: Props) {
  const isDv = language === 'dv';
  return (
    <VeliProvider language={language}>
      <div data-docs-accordion-state={state}>
        <Accordion
          size={size}
          alignment={alignment}
          flushed={flushed}
          defaultExpandedKeys={state ? [] : ['overview']}
        >
          <AccordionItem id="overview">
            <AccordionHeader level={4}>{isDv ? 'ޚުލާޞާ' : 'Overview'}</AccordionHeader>
            <AccordionPanel>
              {isDv
                ? 'ބަދަލެއް ގެނައުމުގެ ކުރިން، ހުއްދައިގެ ސްޓޭޓަސް، ހުށަހެޅި ތާރީޚު، އަދި މައްސަލަ ހަވާލުކުރެވިފައިވާ ރިވިއުވަރ ޗެކްކުރައްވާ.'
                : 'Review the permit status, submission date, and assigned reviewer before making changes.'}
            </AccordionPanel>
          </AccordionItem>
          {!state && (
            <AccordionItem id="documents">
              <AccordionHeader level={4}>{isDv ? 'ލިޔެކިޔުންތައް' : 'Documents'}</AccordionHeader>
              <AccordionPanel>
                {isDv
                  ? 'ގުޅޭ ލިޔެކިޔުންތައް އަޕްލޯޑްކުރައްވާ.'
                  : 'Upload a copy of your national ID card and proof of address.'}
              </AccordionPanel>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </VeliProvider>
  );
}
