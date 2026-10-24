import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@veli-design/react/toast';

const toastQueue = createToastQueue<VeliToastContent>();

type Draft = { id: string; title: string };

const initialDrafts: Draft[] = [
  { id: 'd1', title: 'Building permit draft' },
  { id: 'd2', title: 'Business registration draft' },
];

export function DraftsList() {
  const [drafts, setDrafts] = useState(initialDrafts);

  function deleteDraft(draft: Draft) {
    setDrafts((current) => current.filter((item) => item.id !== draft.id));
    toastQueue.add({
      title: 'Draft deleted',
      description: draft.title,
      actions: [
        {
          id: 'undo',
          label: 'Undo',
          onPress: () => setDrafts((current) => [...current, draft]),
        },
      ],
    });
  }

  return (
    <>
      <ul>
        {drafts.map((draft) => (
          <li key={draft.id}>
            {draft.title}
            <Button intent="danger" onPress={() => deleteDraft(draft)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <ToastRegion queue={toastQueue} />
    </>
  );
}
