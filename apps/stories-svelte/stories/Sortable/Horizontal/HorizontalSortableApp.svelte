<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {move} from '@dnd-kit/helpers';
  import HorizontalSortableItem from './HorizontalSortableItem.svelte';

  let items = $state(Array.from({length: 10}, (_, i) => i + 1));
  let snapshot: number[] = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event: any) {
    items = move(items, event);
  }

  function onDragEnd(event: any) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <div style="display: inline-flex; flex-direction: row; align-items: stretch; height: 180px; gap: 18px; padding: 0 30px;">
    {#each items as id, index (id)}
      <HorizontalSortableItem {id} {index} />
    {/each}
  </div>
</DragDropProvider>
