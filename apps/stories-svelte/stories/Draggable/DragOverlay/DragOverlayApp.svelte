<script lang="ts">
  import {DragDropProvider, DragOverlay} from '@dnd-kit/svelte';
  import DraggableItem from './DraggableItem.svelte';
</script>

<DragDropProvider>
  <div>
    <DraggableItem />
    <DragOverlay>
      {#snippet children(source)}
        <button class="btn" data-shadow="true">overlay</button>
      {/snippet}
    </DragOverlay>
  </div>
</DragDropProvider>
