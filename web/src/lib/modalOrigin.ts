let lastTrigger: Element | null = null;

if (typeof window !== 'undefined') {
  const remember = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    lastTrigger =
      target.closest('button, a, [role="button"], [data-dialog-trigger]') ?? target;
  };
  window.addEventListener('pointerdown', remember, true);
  window.addEventListener('click', remember, true);
}

/** The control the visitor last activated; dialogs scale out of it and back into it. */
export function lastModalTrigger(): Element | null {
  return lastTrigger;
}
