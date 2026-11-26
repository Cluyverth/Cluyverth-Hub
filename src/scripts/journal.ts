function enhanceJournal(): void {
  const results = document.querySelector<HTMLElement>('#journal-results');
  const select = document.querySelector<HTMLSelectElement>('#journal-year');
  const filter = select?.closest<HTMLElement>('.journal-filter');
  const count = document.querySelector<HTMLElement>('#journal-count');
  const pagination = document.querySelector<HTMLElement>('.journal-pagination');
  const more = pagination?.querySelector('button');
  if (!results || !select || !filter || !count || !pagination || !more) return;

  const archive = Array.from(results.querySelectorAll<HTMLElement>('.journal-year'), (section) => ({
    section,
    year: section.dataset.year,
    months: Array.from(section.querySelectorAll<HTMLElement>('.journal-month'), (group) => ({
      group,
      entries: group.querySelectorAll<HTMLLIElement>('.journal-entry'),
    })),
  }));
  const pageSize = 12;
  let limit = pageSize;

  const render = (focusIndex = -1): void => {
    const selectedYear = select.value;
    let total = 0;
    let firstNew: HTMLLIElement | undefined;
    for (const { section, year, months } of archive) {
      const matches = !selectedYear || selectedYear === year;
      section.hidden = !matches || total >= limit;
      if (!matches) continue;
      for (const { group, entries } of months) {
        group.hidden = total >= limit;
        for (const entry of entries) {
          entry.hidden = total >= limit;
          if (total === focusIndex) firstNew = entry;
          total++;
        }
      }
    }
    count.textContent = total > limit ? `${limit} de ${total} textos` : `${total} ${total === 1 ? 'texto' : 'textos'}`;
    pagination.hidden = total <= limit;
    firstNew?.querySelector('a')?.focus();
  };

  const revealFragment = (): HTMLElement | undefined => {
    const anchor = document.getElementById(location.hash.slice(1));
    const year = anchor?.closest<HTMLElement>('.journal-year');
    if (!anchor || !year || !results.contains(year)) return;
    const group = anchor.closest('.journal-month') ?? year;
    const target = anchor.closest('.journal-entry') ?? group.querySelector('.journal-entry');
    if (select.value && select.value !== year.dataset.year) select.value = '';
    const selectedYear = select.value;

    let position = 0;
    for (const { year, months } of archive) {
      if (selectedYear && selectedYear !== year) continue;
      for (const { entries } of months) {
        for (const entry of entries) {
          if (entry === target) {
            limit = Math.max(limit, Math.ceil((position + 1) / pageSize) * pageSize);
            return anchor;
          }
          position++;
        }
      }
    }
  };

  select.addEventListener('change', () => {
    limit = pageSize;
    render();
  });
  more.addEventListener('click', () => {
    const previousLimit = limit;
    limit += pageSize;
    render(previousLimit);
  });
  window.addEventListener('hashchange', () => {
    const anchor = revealFragment();
    if (!anchor) return;
    render();
    anchor.scrollIntoView();
  });

  revealFragment();
  render();
  filter.hidden = false;
}

enhanceJournal();
