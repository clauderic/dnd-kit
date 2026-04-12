<script lang="ts">
  import {Feedback} from '@dnd-kit/dom';
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {move} from '@dnd-kit/helpers';
  import SortableDynamicFeedbackItem from './SortableDynamicFeedbackItem.svelte';

  let items = $state(Array.from({length: 100}, (_, i) => i + 1));
  let snapshot: number[] = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event: any) {
    items = move(items, event);
  }

  function onDragEnd(event: any) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      <SortableDynamicFeedbackItem {id} {index} />
    {/each}
  </ul>
</DragDropProvider>
