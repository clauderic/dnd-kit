<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {move} from '@dnd-kit/helpers';
  import GridSortableItem from './GridSortableItem.svelte';

  let items = $state(Array.from({length: 20}, (_, i) => i + 1));

  function onDragEnd(event: any) {
    items = move(items, event);
  }
</script>

<DragDropProvider {onDragEnd}>
  <div style="display: grid; grid-template-columns: repeat(auto-fill, 150px); grid-auto-rows: 150px; grid-auto-flow: dense; gap: 18px; padding: 0 30px; max-width: 900px; margin-inline: auto; justify-content: center;">
    {#each items as id, index (id)}
      <GridSortableItem {id} {index} />
    {/each}
  </div>
</DragDropProvider>
