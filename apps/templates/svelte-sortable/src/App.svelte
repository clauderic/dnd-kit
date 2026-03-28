<script>
  import {DragDropProvider} from '@dnd-kit/svelte';
  import {createSortable} from '@dnd-kit/svelte/sortable';
  import {move} from '@dnd-kit/helpers';

  let items = $state([1, 2, 3, 4, 5]);

  function onDragEnd(event) {
    items = move(items, event);
  }
</script>

<DragDropProvider {onDragEnd}>
  <ul class="list">
    {#each items as id, index (id)}
      {@const sortable = createSortable({id, index: () => index})}
      <li {@attach sortable.attach} class="item">
        Item {id}
      </li>
    {/each}
  </ul>
</DragDropProvider>
