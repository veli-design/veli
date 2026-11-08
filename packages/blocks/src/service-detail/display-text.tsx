/** Isolate Latin runs so amounts and references retain their reading order in RTL content. */
export function DisplayText({ text }: { text: string }) {
  // Keep word-separating spaces outside the LTR isolate so they separate RTL neighbours.
  return text
    .split(/([A-Za-z0-9](?:[A-Za-z0-9 .,–—−+/%()·:-]*[A-Za-z0-9.,–—−+/%()·:-])?)/g)
    .map((part, index) =>
      /^[A-Za-z0-9]/.test(part) ? (
        <bdi
          key={index}
          dir="ltr"
          lang={/[A-Za-z]/.test(part) ? 'en' : undefined}
          className={/[A-Za-z]/.test(part) ? 'veli-service-detail-latin' : undefined}
        >
          {part}
        </bdi>
      ) : (
        part
      ),
    );
}
