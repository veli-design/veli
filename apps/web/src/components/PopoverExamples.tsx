import { Button } from '@veli-design/react/button';
import {
  Popover,
  PopoverContent,
  PopoverDialog,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  type PopoverIntent,
} from '@veli-design/react/popover';
import { InfoIcon, UserIcon } from '@phosphor-icons/react';

export function PopoverUsageDemo() {
  return (
    <div className="flex min-h-[180px] items-center justify-center">
      <PopoverTrigger>
        <Button intent="secondary">Account</Button>
        <Popover placement="bottom" className="w-[274px] max-w-[calc(100vw-24px)]">
          <PopoverDialog>
            {({ close }) => (
              <>
                <PopoverHeader title="Account" icon={<UserIcon aria-hidden />} onClose={close} />
                <PopoverContent>
                  <p className="type-body-sm-regular">
                    Signed in as Aishath Ali. Manage your profile and notification preferences.
                  </p>
                </PopoverContent>
                <PopoverFooter label="Step 1 of 2">
                  <Button intent="primary" size="xs" onPress={close}>
                    Next
                  </Button>
                </PopoverFooter>
              </>
            )}
          </PopoverDialog>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}

const popoverFooterButtonIntent = (intent: PopoverIntent) =>
  intent === 'primary' ? 'secondary' : 'primary';

export function PopoverIntentsDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {(['primary', 'secondary', 'tertiary'] as const).map((intent) => (
        <PopoverTrigger key={intent}>
          <Button intent="secondary">{intent.charAt(0).toUpperCase() + intent.slice(1)}</Button>
          <Popover
            intent={intent}
            placement="bottom"
            className="w-[274px] max-w-[calc(100vw-24px)]"
          >
            <PopoverDialog>
              {({ close }) => (
                <>
                  <PopoverHeader
                    title="Header title"
                    icon={<InfoIcon aria-hidden />}
                    onClose={close}
                  />
                  <PopoverContent>
                    <p className="type-body-sm-regular">
                      Header, footer, and arrow colors follow the intent.
                    </p>
                  </PopoverContent>
                  <PopoverFooter label="Label">
                    <Button intent={popoverFooterButtonIntent(intent)} size="xs">
                      Previous
                    </Button>
                    <Button intent={popoverFooterButtonIntent(intent)} size="xs" onPress={close}>
                      Next
                    </Button>
                  </PopoverFooter>
                </>
              )}
            </PopoverDialog>
          </Popover>
        </PopoverTrigger>
      ))}
    </div>
  );
}
