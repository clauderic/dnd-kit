import type { types as t } from '@marko/compiler';
import { consumerEnter, consumerExit } from '../_translator-utils.js';

export function enter(tag: t.NodePath<t.MarkoTag>): void {
  consumerEnter(tag);
}

export function exit(tag: t.NodePath<t.MarkoTag>): void {
  consumerExit(tag);
}