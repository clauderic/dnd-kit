<script lang="ts">
  import {createSortable} from '@dnd-kit/svelte/sortable';

  let {id, index}: {id: number; index: number} = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
  });
</script>

<div
  {@attach sortable.attach}
  class="item"
  data-shadow={sortable.isDragging ? 'true' : undefined}
  style="aspect-ratio: 1; justify-content: center;"
>
  {id}
</div>
