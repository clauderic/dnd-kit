import {getWindow} from './getWindow.ts';

export default function getIframe(target: Event['target']) {
  const win = getWindow(target);

  if (win && win.self !== win.parent) {
    const iframe = win.frameElement as HTMLIFrameElement | null;

    return iframe;
  }

  return null;
}
