import { isNode } from '../type-guards/isNode.ts';
import { isShadowRoot } from '../type-guards/isShadowRoot.ts';
import { getDocument } from './getDocument.ts';

export function getRoot(target: Event['target'] | undefined): Document | ShadowRoot {

	if (target && isNode(target)) {
		let root = target.getRootNode();
		if (isShadowRoot(root)) {
			return root as ShadowRoot;
		}
		else if (root instanceof Document) {
			return root as Document;
		}
	}
	return getDocument(target);
}