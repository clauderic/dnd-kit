<script>
  import {DragDropProvider, createDraggable, createDroppable} from '@dnd-kit/svelte';

  let parent = $state(undefined);

  function onDragEnd(event) {
    if (event.canceled) return;
    parent = event.operation.target?.id;
  }

  const draggable = createDraggable({id: 'draggable'});
  const droppable = createDroppable({id: 'droppable'});
</script>

<DragDropProvider {onDragEnd}>
  <div class="container">
    {#if parent == null}
      <button {@attach draggable.attach} class="draggable">Drag me</button>
    {/if}
    <div {@attach droppable.attach} class="droppable" class:active={droppable.isDropTarget}>
      {#if parent === 'droppable'}
        <button {@attach draggable.attach} class="draggable">Drag me</button>
      {:else}
        Drop here
      {/if}
    </div>
  </div>
</DragDropProvider>
