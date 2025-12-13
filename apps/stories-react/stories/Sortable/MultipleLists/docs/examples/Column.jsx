import React from 'react';
import {useDroppable} from '@dnd-kit/react';
import {CollisionPriority} from '@dnd-kit/abstract';

const styles = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: 20,
  minWidth: 200,
  backgroundColor: 'rgba(0,0,0,0.1)',
  borderRadius: 10,
};

export function Column({children, id}) {
  const {ref} = useDroppable({
    id,
    type: 'column',
    accept: ['item'],
    collisionPriority: CollisionPriority.Low,
  });

  return (
    <div style={styles} ref={ref}>
      {children}
    </div>
  );
}
