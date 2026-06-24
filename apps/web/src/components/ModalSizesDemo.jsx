import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Modal } from '@tradenetcorp/veli-ui/modal';

const SIZES = ['sm', 'md', 'lg', 'xl', 'full'];

export function ModalSizesDemo() {
  const [activeSize, setActiveSize] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {SIZES.map((size) => (
          <Button
            key={size}
            intent="secondary"
            appearance="transparent"
            onPress={() => setActiveSize(size)}
          >
            Open {size.toUpperCase()}
          </Button>
        ))}
      </div>

      <Modal
        size={activeSize ?? 'md'}
        isOpen={activeSize !== null}
        onOpenChange={(isOpen) => setActiveSize(isOpen ? activeSize : null)}
      >
        <Modal.Header>
          <Modal.Title>{(activeSize ?? 'md').toUpperCase()} modal</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Content>
          <p>
            Resize behavior is token-based and keeps spacing and typography consistent across all
            size variants.
          </p>
        </Modal.Content>
        <Modal.Footer>
          <Button onPress={() => setActiveSize(null)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
