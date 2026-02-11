<script setup lang="ts">
import {ref, computed, h, defineComponent} from 'vue';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider, PointerSensor, KeyboardSensor} from '@dnd-kit/vue';
import {useSortable} from '@dnd-kit/vue/sortable';
import {defaultPreset} from '@dnd-kit/dom';
import {move} from '@dnd-kit/helpers';

function createRange(length: number) {
  return Array.from({length}, (_, i) => i + 1);
}

function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const ITEM_COUNT = 6;

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const sensors = [
  PointerSensor.configure({
    activatorElements(source) {
      return [source.element, source.handle];
    },
  }),
  KeyboardSensor,
];

const SortableItem = defineComponent({
  props: {
    id: {type: String, required: true},
    column: {type: String, required: true},
    index: {type: Number, required: true},
  },
  setup(props) {
    const element = ref<HTMLElement | null>(null);
    const handle = ref<HTMLElement | null>(null);
    const {isDragging} = useSortable({
      id: computed(() => props.id),
      index: computed(() => props.index),
      group: computed(() => props.column),
      element,
      handle,
      accept: 'item',
      type: 'item',
      feedback: 'clone',
      data: computed(() => ({group: props.column})),
    });

    return () =>
      h(
        'li',
        {
          ref: element,
          class: 'item',
          'data-shadow': isDragging.value ? 'true' : undefined,
          'data-accent-color': props.column,
          style: {'--accent-color': COLORS[props.column]},
        },
        [props.id, h('button', {ref: handle, class: 'handle'})]
      );
  },
});

const SortableColumn = defineComponent({
  props: {
    id: {type: String, required: true},
    index: {type: Number, required: true},
    rows: {type: Array as () => string[], required: true},
  },
  setup(props) {
    const element = ref<HTMLElement | null>(null);
    const handle = ref<HTMLElement | null>(null);
    const {isDragging} = useSortable({
      id: computed(() => props.id),
      index: computed(() => props.index),
      element,
      handle,
      accept: ['column', 'item'],
      collisionPriority: CollisionPriority.Low,
      type: 'column',
    });

    return () =>
      h(
        'div',
        {
          ref: element,
          class: 'container',
          'data-shadow': isDragging.value ? 'true' : undefined,
        },
        [
          h('div', {class: 'container-header'}, [
            props.id,
            h('button', {ref: handle, class: 'handle'}),
          ]),
          h(
            'ul',
            {},
            props.rows.map((itemId, itemIndex) =>
              h(SortableItem, {
                key: itemId,
                id: itemId,
                column: props.id,
                index: itemIndex,
              })
            )
          ),
        ]
      );
  },
});

const items = ref<Record<string, string[]>>({
  A: createRange(ITEM_COUNT).map((id) => `A${id}`),
  B: createRange(ITEM_COUNT).map((id) => `B${id}`),
  C: createRange(ITEM_COUNT).map((id) => `C${id}`),
  D: [],
});

const columns = Object.keys(items.value);
let snapshot = cloneDeep(items.value);

function onDragStart() {
  snapshot = cloneDeep(items.value);
}

function onDragOver(event: any) {
  const {source} = event.operation;
  if (source && source.type === 'column') return;
  items.value = move(items.value, event);
}

function onDragEnd(event: any) {
  if (event.canceled) {
    items.value = snapshot;
  }
}
</script>

<template>
  <DragDropProvider
    :plugins="defaultPreset.plugins"
    :sensors="sensors"
    @dragStart="onDragStart"
    @dragOver="onDragOver"
    @dragEnd="onDragEnd"
  >
    <div class="multiple-lists-container">
      <SortableColumn
        v-for="(column, columnIndex) in columns"
        :key="column"
        :id="column"
        :index="columnIndex"
        :rows="items[column]"
      />
    </div>
  </DragDropProvider>
</template>
