<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import DraggableItem from './DraggableItem.svelte';
  import DroppableZone from './DroppableZone.svelte';

  let parent = $state<string | undefined>(undefined);

  function onDragEnd(event: any) {
    if (event.canceled) return;
    parent = event.operation.target?.id;
  }
</script>

<DragDropProvider {onDragEnd}>
  <section class="drop-layout">
    {#if parent == null}
      <DraggableItem />
    {/if}
    <DroppableZone id="droppable">
      {#if parent === 'droppable'}
        <DraggableItem />
      {/if}
    </DroppableZone>
  </section>
</DragDropProvider>
