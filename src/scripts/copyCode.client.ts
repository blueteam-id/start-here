// Adds a "Copy" button to every command code block inside `root` (the
// rendered lesson body). Plain vanilla DOM APIs only, no framework runtime.
//
// Only blocks tagged with a shell, Python, SQL, or JavaScript language get a
// button (things a learner types or pastes); untagged
// blocks are sample output (a permission string, conflict markers), which
// nobody needs to paste back into a terminal.

const COPYABLE_LANGUAGES = new Set(['bash', 'sh', 'shell', 'zsh', 'powershell', 'ps1', 'pwsh', 'python', 'sql', 'javascript']);
const RESET_AFTER_MS = 2000;

export type CopyFn = (text: string) => Promise<void>;

/** Copies via the async Clipboard API, falling back to a hidden textarea. */
export const defaultCopy: CopyFn = async (text) => {
  if (globalThis.navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the legacy path (e.g. non-secure context).
    }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) throw new Error('copy failed');
};

/** The text a learner should get on their clipboard for one block. */
export function codeText(pre: HTMLElement): string {
  return (pre.textContent ?? '').replace(/\n+$/, '');
}

export function wireCopyButtons(root: HTMLElement, copy: CopyFn = defaultCopy): void {
  root.querySelectorAll<HTMLElement>('pre[data-language]').forEach((pre) => {
    const language = (pre.getAttribute('data-language') ?? '').toLowerCase();
    if (!COPYABLE_LANGUAGES.has(language)) return;
    if (pre.parentElement?.classList.contains('code-block')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';
    pre.replaceWith(wrapper);
    wrapper.appendChild(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-block__copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy command to clipboard');
    wrapper.appendChild(button);

    let timer: ReturnType<typeof setTimeout> | undefined;
    button.addEventListener('click', async () => {
      try {
        await copy(codeText(pre));
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Press Ctrl+C';
        selectContents(pre);
      }
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = 'Copy';
      }, RESET_AFTER_MS);
    });
  });
}

// Last resort when the clipboard is blocked: select the text so the learner
// can copy it with the keyboard.
function selectContents(element: HTMLElement): void {
  const selection = globalThis.getSelection?.();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  selection.removeAllRanges();
  selection.addRange(range);
}
