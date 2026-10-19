import { Spinner } from '@tradenetcorp/veli-ui/spinner';
import { LoadingText } from '@tradenetcorp/veli-ui/loading-text';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

export function LoadingUsageDemo() {
  const { language } = useVeliLanguage();
  return (
    <div className="flex flex-wrap items-center gap-8">
      <Spinner size="lg" aria-label={language === 'dv' ? 'ލޯޑުވަނީ' : 'Loading content'} />
      <Spinner variant="button" aria-label={language === 'dv' ? 'ރައްކާކުރަނީ' : 'Saving'} />
      <LoadingText>
        {language === 'dv' ? 'ކިޔާލެވިފައި ކަމަށް ބަދަލުކުރަނީ' : 'Marking all as read'}
      </LoadingText>
    </div>
  );
}
