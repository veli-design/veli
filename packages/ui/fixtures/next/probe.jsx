'use client';
import { Input } from '@tradenetcorp/veli-ui/input';
import { PasswordInput } from '@tradenetcorp/veli-ui/password-input';
import { Modal } from '@tradenetcorp/veli-ui/modal';
export default function Probe() {
  return (
    <main>
      <h1>Veli ESM probe</h1>
      <Input label="Name" />
      <PasswordInput label="Password" />
      <Modal isOpen={false}>Hello</Modal>
    </main>
  );
}
