<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {move} from '@dnd-kit/helpers';
  import SortableItemWithHandle from './SortableItemWithHandle.svelte';

  let items = $state(Array.from({length: 100}, (_, i) => i + 1));

  function onDragEnd(event: any) {
    items = move(items, event);
  }
</script>

<DragDropProvider {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      <SortableItemWithHandle {id} {index} />
    {/each}
  </ul>
</DragDropProvider>
