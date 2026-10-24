import { Spinner } from '@veli-design/react/spinner';
import { LoadingText } from '@veli-design/react/loading-text';
import { useVeliLanguage } from '@veli-design/react/provider';

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
