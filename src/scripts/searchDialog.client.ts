// The header search: a magnifier button that opens a dialog with Pagefind's
// search box. Pagefind's files are only loaded the first time the dialog
// opens, so pages stay light for everyone who never searches.
//
// Shortcuts: "/" or Ctrl+K / Cmd+K opens it, Esc closes it (native dialog).
// Without JavaScript the button is a plain link to /search/.

declare global {
  interface Window {
    PagefindUI?: new (options: Record<string, unknown>) => { triggerSearch(term: string): void };
  }
}

/** True when a keypress should open search, and not while typing in a field. */
export function isSearchShortcut(event: KeyboardEvent): boolean {
  const target = event.target as HTMLElement | null;
  const typing =
    !!target &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
  if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) return true;
  if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) return true;
  return false;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function loadStylesheet(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export const PAGEFIND_OPTIONS = {
  showSubResults: true,
  showImages: false,
  resetStyles: false,
  translations: {
    placeholder: 'Search lessons, e.g. grep, UAC, merge conflict',
    clear_search: 'Clear',
  },
};

export function wireSearchDialog(trigger: HTMLAnchorElement, dialog: HTMLDialogElement): void {
  const mount = dialog.querySelector<HTMLElement>('[data-search-mount]');
  const unavailable = dialog.querySelector<HTMLElement>('[data-search-unavailable]');
  let ready: Promise<void> | null = null;

  function setUp(): Promise<void> {
    if (ready) return ready;
    loadStylesheet('/pagefind/pagefind-ui.css');
    ready = loadScript('/pagefind/pagefind-ui.js')
      .then(() => {
        if (!window.PagefindUI || !mount) throw new Error('Pagefind UI missing');
        new window.PagefindUI({ ...PAGEFIND_OPTIONS, element: mount, autofocus: true });
      })
      .catch(() => {
        // The index only exists in a built site (not in `npm run dev`).
        if (unavailable) unavailable.hidden = false;
      });
    return ready;
  }

  function open(): void {
    if (!dialog.open) dialog.showModal();
    void setUp().then(() => {
      dialog.querySelector<HTMLInputElement>('.pagefind-ui__search-input')?.focus();
    });
  }

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    open();
  });

  document.addEventListener('keydown', (event) => {
    if (dialog.open || !isSearchShortcut(event)) return;
    event.preventDefault();
    open();
  });

  dialog.querySelector('[data-search-close]')?.addEventListener('click', () => dialog.close());

  // Clicking the dimmed backdrop (outside the panel) closes the dialog.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  // Following a result closes the dialog, so Back returns to a clean page.
  dialog.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a.pagefind-ui__result-link')) dialog.close();
  });
}
