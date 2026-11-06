// Client-side search and category filtering for CatalogView.astro. Plain
// vanilla DOM APIs only, no framework runtime. The underlying track list is
// always fully server-rendered; this only hides/shows cards and category
// groups that don't match the current search text and selected chip.

/**
 * Wires the search input and filter chips for a CatalogView root element.
 * Hides `[data-catalog-category]` groups (and the `TrackCard`s inside them)
 * that don't match the current filters, and shows the "no tracks match"
 * message when every group ends up empty.
 */
export function wireCatalogFilter(root: HTMLElement): void {
  const searchInput = root.querySelector<HTMLInputElement>('[data-catalog-search]');
  const chips = root.querySelectorAll<HTMLButtonElement>('[data-catalog-chip]');
  const categoryGroups = root.querySelectorAll<HTMLElement>('[data-catalog-category]');
  const emptyMessage = root.querySelector<HTMLElement>('[data-catalog-empty]');

  let activeCategory = 'all';

  function apply(): void {
    const query = (searchInput?.value ?? '').trim().toLowerCase();
    let anyVisible = false;

    categoryGroups.forEach((group) => {
      const category = group.getAttribute('data-catalog-category') ?? '';
      const categoryMatches = activeCategory === 'all' || activeCategory === category;

      const cards = group.querySelectorAll<HTMLElement>('.track-card');
      let groupHasVisibleCard = false;

      cards.forEach((card) => {
        const title = card.querySelector('.track-card__title')?.textContent ?? '';
        const summary = card.querySelector('.track-card__summary')?.textContent ?? '';
        const text = `${title} ${summary}`.toLowerCase();
        const matchesSearch = query === '' || text.includes(query);
        const visible = categoryMatches && matchesSearch;

        card.toggleAttribute('hidden', !visible);
        if (visible) groupHasVisibleCard = true;
      });

      group.toggleAttribute('hidden', !groupHasVisibleCard);
      if (groupHasVisibleCard) anyVisible = true;
    });

    emptyMessage?.toggleAttribute('hidden', anyVisible);
  }

  searchInput?.addEventListener('input', apply);

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      activeCategory = chip.getAttribute('data-catalog-chip') ?? 'all';
      chips.forEach((other) => {
        other.setAttribute('aria-pressed', String(other === chip));
      });
      apply();
    });
  });
}
