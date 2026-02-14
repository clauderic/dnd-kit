<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import DraggableItem from '../DraggableItem.svelte';
  import DroppableZone from '../DroppableZone.svelte';

  let parent = $state<string | undefined>(undefined);
  const droppables = ['A', 'B', 'C'];

  function onDragEnd(event: any) {
    if (event.canceled) return;
    parent = event.operation.target?.id;
  }
</script>

<DragDropProvider {onDragEnd}>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 500px; margin: 0 auto;">
    <div style="display: flex; align-items: center; justify-content: center;">
      {#if parent == null}
        <DraggableItem />
      {/if}
    </div>
    {#each droppables as id (id)}
      <DroppableZone {id}>
        {#if parent === id}
          <DraggableItem />
        {/if}
      </DroppableZone>
    {/each}
  </div>
</DragDropProvider>
