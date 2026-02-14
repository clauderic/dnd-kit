<script lang="ts">
  import {DragDropProvider} from '@dnd-kit/svelte';
  import DraggableWithHandle from './DraggableWithHandle.svelte';
</script>

<DragDropProvider>
  <DraggableWithHandle />
</DragDropProvider>
