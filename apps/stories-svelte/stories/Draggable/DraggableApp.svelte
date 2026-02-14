<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import Draggable from './Draggable.svelte';
</script>

<DragDropProvider>
  <Draggable />
</DragDropProvider>
