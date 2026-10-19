import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@tradenetcorp/veli-ui/toast';

const toastQueue = createToastQueue<VeliToastContent>();

type Draft = { id: string; title: string };

export function DraftsList() {
  const [drafts, setDrafts] = useState<Draft[]>([
    { id: 'd1', title: 'Building permit draft' },
    { id: 'd2', title: 'Business registration draft' },
  ]);

  function deleteDraft(draft: Draft) {
    setDrafts((current) => current.filter((item) => item.id !== draft.id));
    toastQueue.add(
      {
        title: 'Draft deleted',
        actions: [{ label: 'Undo', onPress: () => setDrafts((current) => [...current, draft]) }],
      },
      { timeout: 3000 },
    );
  }

  return (
    <>
      {drafts.map((draft) => (
        <Button key={draft.id} onPress={() => deleteDraft(draft)}>
          Delete {draft.title}
        </Button>
      ))}
      <ToastRegion queue={toastQueue} />
    </>
  );
}
