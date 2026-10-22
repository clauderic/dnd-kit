export interface BoardNode {
  id: string;
  title: string;
  color: string;
  children?: BoardNode[];
  tag?: string;
  note?: string;
  owner?: string;
}

const colors = {
  blue: '#6384d8',
  purple: '#9776ce',
  green: '#549981',
  orange: '#c38b49',
};

export function initialItems(): BoardNode[] {
  const card = (
    id: string,
    title: string,
    tag: string,
    owner: string,
    color: string,
    note?: string
  ): BoardNode => ({id, title, tag, owner, color, note});
  const collection = (
    id: string,
    title: string,
    color: string,
    children: BoardNode[]
  ): BoardNode => ({id, title, color, children});
  return [
    collection('ideas', 'Ideas & exploration', colors.blue, [
      collection('website', 'Website refresh', colors.blue, [
        card(
          'moodboard',
          'Find a fresh direction',
          'Design',
          'Alex Morgan',
          colors.purple,
          '4 references'
        ),
        card(
          'wireframes',
          'Sketch the first ideas',
          'Design',
          'Jamie Lee',
          colors.blue
        ),
      ]),
      card(
        'feedback',
        'Listen to our customers',
        'Research',
        'Sam Rivera',
        colors.orange,
        '6 notes'
      ),
      collection('someday', 'Someday, maybe', colors.orange, []),
    ]),
    collection('progress', 'In the making', colors.purple, [
      collection('system', 'Design system', colors.purple, [
        card(
          'tokens',
          'Make color feel consistent',
          'Foundation',
          'Jamie Lee',
          colors.purple
        ),
        collection('components', 'Components', colors.green, [
          card(
            'buttons',
            'Give buttons some love',
            'Interface',
            'Alex Morgan',
            colors.green
          ),
          card(
            'inputs',
            'Sweat the small details',
            'Interface',
            'Sam Rivera',
            colors.green
          ),
        ]),
      ]),
      card(
        'motion',
        'Add a little personality',
        'Motion',
        'Alex Morgan',
        colors.purple
      ),
    ]),
    collection('ready', 'Ready for the world', colors.green, [
      card(
        'welcome',
        'A warmer welcome',
        'Onboarding',
        'Sam Rivera',
        colors.green,
        'Ready to share'
      ),
      collection('launch', 'Launch essentials', colors.orange, [
        card('story', 'Tell the story', 'Writing', 'Jamie Lee', colors.orange),
        card(
          'checklist',
          'One last look',
          'Review',
          'Alex Morgan',
          colors.blue
        ),
      ]),
    ]),
  ];
}

export function locate(
  items: BoardNode[],
  id: string,
  parent: string | null = null
): {node: BoardNode; parent: string | null; index: number} | undefined {
  for (const [index, node] of items.entries()) {
    if (node.id === id) return {node, parent, index};
    const child = node.children && locate(node.children, id, node.id);
    if (child) return child;
  }
}

/** The story owns its tree; a collection can never move into its own subtree. */
export function moveNode(
  items: BoardNode[],
  id: string,
  parent: string | null,
  index: number
): BoardNode[] {
  const from = locate(items, id);
  if (
    !from ||
    parent === id ||
    (parent && locate(from.node.children ?? [], parent))
  )
    return items;
  if (from.parent === parent && from.index === index) return items;
  if (parent && !locate(items, parent)?.node.children) return items;

  const next = structuredClone(items);
  const origin = from.parent ? locate(next, from.parent)!.node.children! : next;
  const destination = parent ? locate(next, parent)!.node.children! : next;
  const [node] = origin.splice(from.index, 1);
  destination.splice(index, 0, node);
  return next;
}
