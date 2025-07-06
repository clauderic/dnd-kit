import {create} from 'storybook/theming/create';
import {default as brandImage} from './assets/dnd-kit-banner.svg';

export const theme = create({
  base: 'light',
  brandImage,
  appBg: '#F9F9F9',
});
