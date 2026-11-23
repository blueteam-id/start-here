// Wires the "your progress" tools on the Privacy page: show a progress code,
// copy it, paste one in, or reset everything. Plain vanilla DOM APIs only.
import { exportProgress, importProgress, resetProgress, type TransferStore } from '../lib/progressTransfer';
import { defaultCopy, type CopyFn } from './copyCode.client';

function browserStore(): TransferStore | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export function wireProgressTools(
  root: HTMLElement,
  trackSlugs: string[],
  store: TransferStore | null = browserStore(),
  copy: CopyFn = defaultCopy,
  confirmReset: () => boolean = () => globalThis.confirm('Remove all your progress from this browser?'),
): void {
  const status = root.querySelector<HTMLElement>('[data-progress-status]');
  const exportBox = root.querySelector<HTMLTextAreaElement>('[data-progress-export]');
  const importBox = root.querySelector<HTMLTextAreaElement>('[data-progress-import]');

  function say(message: string): void {
    if (status) status.textContent = message;
  }

  if (!store) {
    say('Your browser is not allowing this site to save anything, so there is no progress to move.');
    root.querySelectorAll<HTMLButtonElement>('button').forEach((b) => (b.disabled = true));
    return;
  }

  const refresh = () => {
    if (exportBox) exportBox.value = exportProgress(trackSlugs, store);
  };
  refresh();

  root.querySelector('[data-progress-copy]')?.addEventListener('click', async () => {
    refresh();
    try {
      await copy(exportBox?.value ?? '');
      say('Progress code copied. Paste it on the other browser or device.');
    } catch {
      exportBox?.select();
      say('Could not copy automatically. The code is selected: press Ctrl+C (or Cmd+C).');
    }
  });

  root.querySelector('[data-progress-load]')?.addEventListener('click', () => {
    try {
      const count = importProgress(importBox?.value ?? '', trackSlugs, store);
      say(count === 1 ? '1 lesson marked as done.' : `${count} lessons marked as done.`);
      if (importBox) importBox.value = '';
      refresh();
    } catch (error) {
      say(error instanceof Error ? error.message : 'That code could not be read.');
    }
  });

  root.querySelector('[data-progress-reset]')?.addEventListener('click', () => {
    if (!confirmReset()) return;
    resetProgress(trackSlugs, store);
    refresh();
    say('All progress on this browser was removed.');
  });
}
