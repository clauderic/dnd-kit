<script lang="ts">
  import {createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<div
  {@attach draggable.attach}
  class="btn"
  data-shadow={draggable.isDragging ? 'true' : undefined}
>
  draggable
  <button {@attach draggable.attachHandle} class="handle" aria-label="Drag handle"></button>
</div>
