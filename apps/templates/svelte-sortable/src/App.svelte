<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {move} from '@dnd-kit/helpers';
  import SortableItem from './SortableItem.svelte';

  let items = $state([1, 2, 3, 4]);
  let snapshot = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event) {
    items = move(items, event);
  }

  function onDragEnd(event) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      <SortableItem {id} {index} />
    {/each}
  </ul>
</DragDropProvider>
