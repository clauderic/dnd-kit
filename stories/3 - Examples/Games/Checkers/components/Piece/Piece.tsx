import React, {forwardRef} from 'react';
import {motion} from 'framer-motion';
import classNames from 'classnames';

import styles from './Piece.module.css';

export interface Props extends React.HTMLAttributes<HTMLElement> {
  id: string;
  odd: boolean;
  clone?: boolean;
  position?: {x: number; y: number};
  disabled?: boolean;
}

export const Piece = forwardRef<HTMLElement, Props>(function Piece(
  {clone, disabled, id, odd, position, ...props},
  ref
) {
  const Component = clone ? 'button' : motion.button;

  return (
    <Component
      ref={ref}
      layoutId={id}
      className={classNames(
        styles.Piece,
        odd ? styles.odd : styles.even,
        disabled && styles.disabled,
        clone && styles.clone
      )}
      data-position={JSON.stringify(position)}
      // aria-describedby={`piece id ${id}`}
      // aria-roledescription="You have selected a piece"
      {...props}
    />
  );
});
