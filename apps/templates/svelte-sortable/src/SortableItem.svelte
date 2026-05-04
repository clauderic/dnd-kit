<script>
  import {createSortable} from '@dnd-kit/svelte/sortable';

  let {id, index} = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
  });
</script>

<li {@attach sortable.attach} class="item">
  Item {id}
</li>
