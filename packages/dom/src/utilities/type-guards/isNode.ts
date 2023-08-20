export function isNode(node: Object): node is Node {
  return 'nodeType' in node;
}
