import getTitle from 'title';

export default function cleanupAndReorder(list, locale, defaultLocale) {
  let meta;
  for (let item of list) {
    if (item.name === 'meta.json' && locale === item.locale) {
      meta = item;
      break;
    }
    // fallback
    if (!meta && item.name === 'meta') {
      meta = item;
    }
  }
  if (!meta) {
    meta = {};
  } else {
    meta = meta.meta;
  }

  const metaKeys = Object.keys(meta);
  const hasLocale = new Map();
  if (locale) {
    list.forEach((a) =>
      a.locale === locale ? hasLocale.set(a.name, true) : null
    );
  }

  return list
    .filter(
      (a) =>
        // not meta
        a.name !== 'meta.json' &&
        // not hidden routes
        !a.name.startsWith('_') &&
        // locale matches, or fallback to default locale
        (a.locale === locale ||
          ((a.locale === defaultLocale || !a.locale) && !hasLocale.get(a.name)))
    )
    .sort((a, b) => {
      const indexA = metaKeys.indexOf(a.name);
      const indexB = metaKeys.indexOf(b.name);
      if (indexA === -1 && indexB === -1) return a.name < b.name ? -1 : 1;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    })
    .map((a) => {
      return {
        ...a,
        children: a.children
          ? cleanupAndReorder(a.children, locale, defaultLocale)
          : undefined,
        title: meta[a.name] || getTitle(a.name),
      };
    });
}
