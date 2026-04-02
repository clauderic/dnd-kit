export type AnchorItem = {
  name: string;
  href: string;
  icon?: string;
  color?: string;
  isActive?: boolean;
};

export type SidebarItemStyle =
  | 'container'
  | 'card'
  | 'border'
  | 'undecorated'
  | 'arrow'
  | 'plain';
