import { Toast, ToastRegion, type VeliToastContent, createToastQueue } from './toast.js';

const queue = createToastQueue<VeliToastContent>();
queue.add({
  title: 'Saved',
  description: 0,
  showCloseButton: false,
  actions: [{ label: 'Retry', intent: 'accent', dismissOnPress: false }],
});
const custom = (
  <ToastRegion
    queue={queue}
    className={({ isHovered }) => (isHovered ? 'hovered' : '')}
    style={() => ({ width: 300 })}
  >
    {({ toast }) => (
      <Toast
        toast={toast}
        className={({ isFocusVisible }) => (isFocusVisible ? 'focused' : '')}
        style={({ toast: current }) => ({ viewTransitionName: current.key })}
      >
        {({ toast: current }) => <span>{current.content.title}</span>}
      </Toast>
    )}
  </ToastRegion>
);
void custom;
