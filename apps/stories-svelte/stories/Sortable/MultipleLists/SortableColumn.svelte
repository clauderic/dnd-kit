<script lang="ts">
  import {CollisionPriority} from '@dnd-kit/abstract';
  import {createSortable} from '@dnd-kit/svelte/sortable';

  import SortableItem from './SortableItem.svelte';

  let {
    id,
    index,
    rows,
    colors,
  }: {
    id: string;
    index: number;
    rows: string[];
    colors: Record<string, string>;
  } = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
    accept: ['column', 'item'],
    collisionPriority: CollisionPriority.Low,
    type: 'column',
  });
</script>

<div
  {@attach sortable.attach}
  class="container"
  data-shadow={sortable.isDragging ? 'true' : undefined}
>
  <h2>
    {id}
    <button {@attach sortable.attachHandle} class="handle" aria-label="Drag handle"></button>
  </h2>
  <ul>
    {#each rows as itemId, itemIndex (itemId)}
      <SortableItem
        id={itemId}
        column={id}
        index={itemIndex}
        accentColor={colors[id]}
      />
    {/each}
  </ul>
</div>
