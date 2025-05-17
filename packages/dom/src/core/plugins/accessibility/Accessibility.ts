import {Plugin} from '@dnd-kit/abstract';
import {isSafari, generateUniqueId, scheduler} from '@dnd-kit/dom/utilities';

import type {DragDropManager} from '../../manager/index.ts';
import {
  defaultAnnouncements,
  defaultAttributes,
  defaultAnnouncementIdPrefix,
  defaultDescriptionIdPrefix,
  defaultScreenReaderInstructions,
} from './defaults.ts';
import type {Announcements, ScreenReaderInstructions} from './types.ts';
import {isFocusable} from './utilities.ts';
import {createHiddenText} from './HiddenText.ts';
import {createLiveRegion} from './LiveRegion.ts';

interface Options {
  /**
   * Optional id that should be used for the accessibility plugin's screen reader instructions and announcements.
   */
  id?: string;
  /**
   * Optional id prefix to use for the accessibility plugin's screen reader instructions and announcements.
   */
  idPrefix?: {
    description?: string;
    announcement?: string;
  };
  /**
   * The announcements to use for the accessibility plugin.
   */
  announcements?: Announcements;
  /**
   * The screen reader instructions to use for the accessibility plugin.
   */
  screenReaderInstructions?: ScreenReaderInstructions;
  /**
   * The number of milliseconds to debounce the announcement updates.
   *
   * @remarks
   * Only the `dragover` and `dragmove` announcements are debounced.
   *
   * @default 500
   */
  debounce?: number;
}

const debouncedEvents = ['dragover', 'dragmove'];

export class Accessibility extends Plugin<DragDropManager> {
  constructor(manager: DragDropManager, options?: Options) {
    super(manager);

    const {
      id,
      idPrefix: {
        description: descriptionPrefix = defaultDescriptionIdPrefix,
        announcement: announcementPrefix = defaultAnnouncementIdPrefix,
      } = {},
      announcements = defaultAnnouncements,
      screenReaderInstructions = defaultScreenReaderInstructions,
      debounce: debounceMs = 500,
    } = options ?? {};

    const descriptionId = id
      ? `${descriptionPrefix}-${id}`
      : generateUniqueId(descriptionPrefix);
    const announcementId = id
      ? `${announcementPrefix}-${id}`
      : generateUniqueId(announcementPrefix);

    let hiddenTextElement: HTMLElement | undefined;
    let liveRegionElement: HTMLElement | undefined;
    let liveRegionTextNode: Node | undefined;
    let latestAnnouncement: string | undefined;

    const updateAnnouncement = (value = latestAnnouncement) => {
      if (!liveRegionTextNode || !value) return;
      if (liveRegionTextNode?.nodeValue !== value) {
        liveRegionTextNode.nodeValue = value;
      }
    };
    const scheduleUpdateAnnouncement = () =>
      scheduler.schedule(updateAnnouncement);
    const debouncedUpdateAnnouncement = debounce(
      scheduleUpdateAnnouncement,
      debounceMs
    );

    const eventListeners = Object.entries(announcements).map(
      ([eventName, getAnnouncement]) => {
        return this.manager.monitor.addEventListener(
          eventName as keyof Announcements,
          (event: any, manager: DragDropManager) => {
            const element = liveRegionTextNode;
            if (!element) return;

            const announcement = getAnnouncement?.(event, manager);

            if (announcement && element.nodeValue !== announcement) {
              latestAnnouncement = announcement;

              if (debouncedEvents.includes(eventName)) {
                debouncedUpdateAnnouncement();
              } else {
                scheduleUpdateAnnouncement();
                debouncedUpdateAnnouncement.cancel();
              }
            }
          }
        );
      }
    );

    const initialize = () => {
      let elements = [];

      if (!hiddenTextElement?.isConnected) {
        hiddenTextElement = createHiddenText(
          descriptionId,
          screenReaderInstructions.draggable
        );
        elements.push(hiddenTextElement);
      }

      if (!liveRegionElement?.isConnected) {
        liveRegionElement = createLiveRegion(announcementId);
        liveRegionTextNode = document.createTextNode('');
        liveRegionElement.appendChild(liveRegionTextNode);
        elements.push(liveRegionElement);
      }

      if (elements.length > 0) {
        document.body.append(...elements);
      }
    };

    const mutations = new Set<() => void>();

    function executeMutations() {
      for (const operation of mutations) {
        operation();
      }
    }

    this.registerEffect(() => {
      mutations.clear();

      // Re-run effect when any of the draggable elements change
      for (const draggable of this.manager.registry.draggables.value) {
        const activator = draggable.handle ?? draggable.element;

        if (activator) {
          if (!hiddenTextElement || !liveRegionElement) {
            mutations.add(initialize);
          }

          if (
            (!isFocusable(activator) || isSafari()) &&
            !activator.hasAttribute('tabindex')
          ) {
            mutations.add(() => activator.setAttribute('tabindex', '0'));
          }

          if (
            !activator.hasAttribute('role') &&
            !(activator.tagName.toLowerCase() === 'button')
          ) {
            mutations.add(() =>
              activator.setAttribute('role', defaultAttributes.role)
            );
          }

          if (!activator.hasAttribute('aria-roledescription')) {
            mutations.add(() =>
              activator.setAttribute(
                'aria-roledescription',
                defaultAttributes.roleDescription
              )
            );
          }

          if (!activator.hasAttribute('aria-describedby')) {
            mutations.add(() =>
              activator.setAttribute('aria-describedby', descriptionId)
            );
          }

          for (const key of ['aria-pressed', 'aria-grabbed']) {
            const value = String(draggable.isDragging);

            if (activator.getAttribute(key) !== value) {
              mutations.add(() => activator.setAttribute(key, value));
            }
          }

          const disabled = String(draggable.disabled);

          if (activator.getAttribute('aria-disabled') !== disabled) {
            mutations.add(() =>
              activator.setAttribute('aria-disabled', disabled)
            );
          }
        }
      }

      if (mutations.size > 0) {
        scheduler.schedule(executeMutations);
      }
    });

    this.destroy = () => {
      super.destroy();
      hiddenTextElement?.remove();
      liveRegionElement?.remove();
      eventListeners.forEach((unsubscribe) => unsubscribe());
    };
  }
}

function debounce(fn: () => void, wait: number) {
  let timeout: NodeJS.Timeout | undefined;
  const debounced = () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  };

  debounced.cancel = () => clearTimeout(timeout);

  return debounced;
}
