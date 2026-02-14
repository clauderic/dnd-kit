<script lang="ts">
  import {createSortable} from '@dnd-kit/svelte/sortable';

  let {id, index}: {id: number; index: number} = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
  });
</script>

<li
  {@attach sortable.attach}
  class="item"
  data-shadow={sortable.isDragging ? 'true' : undefined}
>
  {id}
</li>
