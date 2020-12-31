import React from 'react';

import styles from './Endgame.module.css';

export interface Props {
  winnerLabel: string;
  winnerScore: number;
  onPlayAgain(): void;
}

export function Endgame({onPlayAgain, winnerLabel, winnerScore}: Props) {
  return (
    <ul className={styles.Endgame}>
      <li>
        <h3>
          {winnerLabel} won with {winnerScore} points!
        </h3>

        <button onClick={onPlayAgain}>Play again</button>
      </li>
    </ul>
  );
}
