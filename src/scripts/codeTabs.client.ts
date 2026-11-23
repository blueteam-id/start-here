// Client-side tab-switching logic for CodeTabs.astro. Plain vanilla DOM APIs
// only, no framework runtime. Exported separately from the component so it
// can be unit-tested against a hand-built DOM fragment without rendering
// Astro at all.
//
// A page can hold several CodeTabs groups (Computing Basics lesson 1 has
// three). Picking an OS in one group switches every group on the page, the
// choice is remembered for the next page, and on a first visit the tab
// matching the visitor's OS is shown.
import { detectOS, getPreferredOS, setPreferredOS, type OsId, type PrefStore } from '../lib/prefs';

/**
 * Shows the panel for `os` inside one CodeTabs root and updates the tab
 * buttons to match. Returns false (and changes nothing) when this group has
 * no tab for that OS.
 */
export function showTab(root: HTMLElement, os: string): boolean {
  const tabs = root.querySelectorAll<HTMLElement>('[data-tab]');
  if (![...tabs].some((tab) => tab.getAttribute('data-tab') === os)) return false;

  for (const tab of tabs) {
    const selected = tab.getAttribute('data-tab') === os;
    tab.setAttribute('aria-selected', String(selected));
    tab.setAttribute('tabindex', selected ? '0' : '-1');
  }
  for (const panel of root.querySelectorAll<HTMLElement>('[data-panel]')) {
    if (panel.getAttribute('data-panel') === os) {
      panel.removeAttribute('hidden');
    } else {
      panel.setAttribute('hidden', '');
    }
  }
  return true;
}

/**
 * Wires click and arrow-key handling for one CodeTabs root. `onSelect` runs
 * after the learner picks a tab, with the chosen OS and the tab button.
 */
export function wireCodeTabs(
  root: HTMLElement,
  onSelect?: (os: string, tab: HTMLElement) => void,
): void {
  function select(tab: HTMLElement): void {
    const os = tab.getAttribute('data-tab');
    if (!os) return;
    showTab(root, os);
    onSelect?.(os, tab);
  }

  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const tab = target.closest<HTMLElement>('[data-tab]');
    if (!tab || !root.contains(tab)) return;
    select(tab);
  });

  // Left/Right arrows move between tabs, as the ARIA tabs pattern expects.
  root.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches('[data-tab]')) return;
    const tabs = [...root.querySelectorAll<HTMLElement>('[data-tab]')];
    const index = tabs.indexOf(target);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(index + step + tabs.length) % tabs.length];
    event.preventDefault();
    next.focus();
    select(next);
  });
}

interface GroupOptions {
  store?: PrefStore | null;
  userAgent?: string;
}

/**
 * Wires every CodeTabs group on a page together: applies the remembered
 * (or detected) OS on load, and keeps all groups in sync on every pick.
 */
export function wireCodeTabGroups(groups: HTMLElement[], options: GroupOptions = {}): void {
  const userAgent = options.userAgent ?? globalThis.navigator?.userAgent ?? '';
  const initial = getPreferredOS(options.store) ?? detectOS(userAgent);
  if (initial) groups.forEach((group) => showTab(group, initial));

  for (const group of groups) {
    wireCodeTabs(group, (os, tab) => {
      // Switching groups above the clicked one can change their height and
      // make the page jump; keep the clicked tab where the learner sees it.
      const before = tab.getBoundingClientRect().top;
      groups.forEach((other) => {
        if (other !== group) showTab(other, os);
      });
      setPreferredOS(os as OsId, options.store);
      const shift = tab.getBoundingClientRect().top - before;
      if (shift !== 0) globalThis.scrollBy?.(0, shift);
    });
  }
}
