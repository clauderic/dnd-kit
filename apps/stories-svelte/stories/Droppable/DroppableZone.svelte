<script lang="ts">
  import type {Snippet} from 'svelte';
  import {createDroppable} from '@dnd-kit/svelte';

  let {id, children}: {id: string; children?: Snippet} = $props();

  const droppable = createDroppable({get id() { return id; }});
</script>

<div
  {@attach droppable.attach}
  class="droppable"
  class:active={droppable.isDropTarget}
>
  {@render children?.()}
</div>
