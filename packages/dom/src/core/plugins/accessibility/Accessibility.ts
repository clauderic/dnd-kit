import {effects} from '@dnd-kit/state';
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
  id?: string;
  idPrefix?: {
    description?: string;
    announcement?: string;
  };
  announcements?: Announcements;
  screenReaderInstructions?: ScreenReaderInstructions;
}

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
    } = options ?? {};

    const descriptionId = id
      ? `${descriptionPrefix}-${id}`
      : generateUniqueId(descriptionPrefix);
    const announcementId = id
      ? `${announcementPrefix}-${id}`
      : generateUniqueId(announcementPrefix);

    let hiddenTextElement: HTMLElement | undefined;
    let liveRegionElement: HTMLElement | undefined;
    let latestAnnouncement: string | undefined;

    const updateAnnouncement = () => {
      if (!liveRegionElement || !latestAnnouncement) return;
      if (liveRegionElement.textContent !== latestAnnouncement) {
        liveRegionElement.textContent = latestAnnouncement;
      }
    };

    const eventListeners = Object.entries(announcements).map(
      ([eventName, getAnnouncement]) => {
        return this.manager.monitor.addEventListener(
          eventName as keyof Announcements,
          (event: any, manager: DragDropManager) => {
            const element = liveRegionElement;
            if (!element) return;

            const announcement = getAnnouncement?.(event, manager);

            if (announcement && element.textContent !== announcement) {
              latestAnnouncement = announcement;
              scheduler.schedule(updateAnnouncement);
            }
          }
        );
      }
    );

    const initialize = () => {
      hiddenTextElement = createHiddenText(
        descriptionId,
        screenReaderInstructions.draggable
      );
      liveRegionElement = createLiveRegion(announcementId);

      document.body.append(hiddenTextElement, liveRegionElement);
    };

    const updateAttributes = () => {
      for (const draggable of this.manager.registry.draggables.value) {
        const activator = draggable.handle ?? draggable.element;

        if (activator) {
          if (!hiddenTextElement || !liveRegionElement) {
            initialize();
          }

          if (
            (!isFocusable(activator) || isSafari()) &&
            !activator.hasAttribute('tabindex')
          ) {
            activator.setAttribute('tabindex', '0');
          }

          if (
            !activator.hasAttribute('role') &&
            !(activator.tagName.toLowerCase() === 'button')
          ) {
            activator.setAttribute('role', defaultAttributes.role);
          }

          if (!activator.hasAttribute('role-description')) {
            activator.setAttribute(
              'aria-roledescription',
              defaultAttributes.roleDescription
            );
          }

          if (!activator.hasAttribute('aria-describedby')) {
            activator.setAttribute('aria-describedby', descriptionId);
          }

          for (const key of ['aria-pressed', 'aria-grabbed']) {
            activator.setAttribute(key, String(draggable.isDragging));
          }

          activator.setAttribute('aria-disabled', String(draggable.disabled));
        }
      }
    };

    this.registerEffect(() => {
      // Re-run effect when any of the draggable elements change
      for (const draggable of this.manager.registry.draggables.value) {
        void draggable.element;
        void draggable.handle;
      }

      scheduler.schedule(updateAttributes);
    });

    this.destroy = () => {
      super.destroy();
      hiddenTextElement?.remove();
      liveRegionElement?.remove();
      eventListeners.forEach((unsubscribe) => unsubscribe());
    };
  }
}
