<script lang="ts">
  import {Feedback} from '@dnd-kit/dom';
  import type {Plugins} from '@dnd-kit/abstract';
  import {createSortable} from '@dnd-kit/svelte/sortable';

  let {id, index}: {id: number; index: number} = $props();

  const sortable = createSortable({
    get id() { return id; },
    get index() { return index; },
    plugins: (defaults: Plugins) => [
      ...defaults,
      Feedback.configure({
        feedback: (_source, manager) =>
          manager.dragOperation.activatorEvent instanceof KeyboardEvent
            ? 'clone'
            : 'default',
      }),
    ],
  });
</script>

<li
  {@attach sortable.attach}
  class="item"
  data-shadow={sortable.isDragging ? 'true' : undefined}
>
  {id}
</li>
