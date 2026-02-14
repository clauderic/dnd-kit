<script lang="ts">
  import {createSortable} from '@dnd-kit/svelte/sortable';

  let {
    id,
    column,
    index,
    accentColor,
  }: {
    id: string;
    column: string;
    index: number;
    accentColor: string;
  } = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
    get group() { return column; },
    accept: 'item',
    type: 'item',
    feedback: 'clone',
    get data() { return {group: column}; },
  });
</script>

<li
  {@attach sortable.attach}
  class="item"
  data-shadow={sortable.isDragging ? 'true' : undefined}
  data-accent-color={column}
  style:--accent-color={accentColor}
>
  {id}
  <button {@attach sortable.attachHandle} class="handle" aria-label="Drag handle"></button>
</li>
