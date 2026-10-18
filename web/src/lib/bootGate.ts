/**
 * Counts first responses from independent live-query listeners and fires once,
 * when every listener has either delivered its first snapshot or errored.
 * Repeat snapshots from the same listener never count twice.
 */
export function createLandedGate(sources: number, onReady?: () => void) {
  let pending = sources;
  let ready = false;

  return {
    settle: () => {
      let fired = false;
      return () => {
        if (fired) return;
        fired = true;
        pending -= 1;
        if (pending === 0 && !ready) {
          ready = true;
          onReady?.();
        }
      };
    },
  };
}
