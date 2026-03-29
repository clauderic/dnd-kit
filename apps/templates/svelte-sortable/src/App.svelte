<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {createSortable} from '@dnd-kit/svelte/sortable';
  import {move} from '@dnd-kit/helpers';

  let items = $state([1, 2, 3, 4]);
  let snapshot = [];

  function onDragStart() {
    snapshot = items.slice();
  }

  function onDragOver(event) {
    items = move(items, event);
  }

  function onDragEnd(event) {
    if (event.canceled) items = snapshot;
  }
</script>

<DragDropProvider {onDragStart} {onDragOver} {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      {@const sortable = createSortable({id, get index() { return index; }})}
      <li {@attach sortable.attach} class="item">
        Item {id}
      </li>
    {/each}
  </ul>
</DragDropProvider>
