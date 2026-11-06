// Client-side tab-switching logic for CodeTabs.astro. Plain vanilla DOM APIs
// only, no framework runtime. Exported separately from the component so it
// can be unit-tested against a hand-built DOM fragment without rendering
// Astro at all.

/**
 * Wires click handling for a CodeTabs root element. On a click on any
 * `[data-tab]` button inside `root`, shows the matching `[data-panel]` and
 * hides the rest, and updates `aria-selected` on the tab buttons to match.
 */
export function wireCodeTabs(root: HTMLElement): void {
  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const tabButton = target.closest<HTMLElement>('[data-tab]');
    if (!tabButton || !root.contains(tabButton)) return;

    const selected = tabButton.getAttribute('data-tab');
    if (!selected) return;

    const tabs = root.querySelectorAll<HTMLElement>('[data-tab]');
    for (const tab of tabs) {
      tab.setAttribute('aria-selected', String(tab.getAttribute('data-tab') === selected));
    }

    const panels = root.querySelectorAll<HTMLElement>('[data-panel]');
    for (const panel of panels) {
      if (panel.getAttribute('data-panel') === selected) {
        panel.removeAttribute('hidden');
      } else {
        panel.setAttribute('hidden', '');
      }
    }
  });
}
