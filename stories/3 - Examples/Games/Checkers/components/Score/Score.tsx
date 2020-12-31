import React from 'react';

import styles from './Score.module.css';

export interface Props {
  oddLabel: string;
  evenLabel: string;
  oddScore: number;
  evenScore: number;
  oddTurn: boolean;
}

export function Score({
  evenLabel,
  evenScore,
  oddLabel,
  oddScore,
  oddTurn,
}: Props) {
  return (
    <ul className={styles.Score}>
      <li className={oddTurn ? undefined : styles.disabled}>
        <h3>{oddLabel}'s score</h3>
        <h4>{oddScore}</h4>
      </li>
      <li className={oddTurn ? styles.disabled : undefined}>
        <h3>{evenLabel}'s score</h3>
        <h4>{evenScore}</h4>
      </li>
    </ul>
  );
}
