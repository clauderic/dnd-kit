<script lang="ts">
  import {createDraggable} from '@dnd-kit/svelte';

  const draggable = createDraggable({id: 'draggable'});
</script>

<button
  {@attach draggable.attach}
  class="btn"
  disabled={draggable.isDragging || undefined}
>
  draggable
</button>
