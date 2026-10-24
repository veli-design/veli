'use client';
import { Input } from '@veli-design/react/input';
import { PasswordInput } from '@veli-design/react/password-input';
import { Modal } from '@veli-design/react/modal';
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
