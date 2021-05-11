import React from 'react';
import classNames from 'classnames';
import Slugger from 'github-slugger';
import innerText from 'react-innertext';

import {useActiveAnchor} from './ActiveAnchor';
import styles from './Anchors.module.css';

interface Props {
  items: {value: string; depth: number}[];
}

export function Anchors({items: anchors}: Props) {
  const slugger = new Slugger();
  const activeAnchor = useActiveAnchor();

  if (anchors && anchors.length) {
    let activeIndex = -1;

    const anchorInfo = anchors.map(({depth, value}, i) => {
      const text = innerText(value) || '';
      const slug = slugger.slug(text);

      if (activeAnchor[slug]) {
        activeIndex = i;
      }

      return {depth, text, slug};
    });

    return (
      <ul>
        {anchors.map((_, i) => {
          const {slug, depth, text} = anchorInfo[i];
          const isActive = i === activeIndex;

          return (
            <li key={`a-${slug}`}>
              <a
                href={'#' + slug}
                className={classNames(
                  styles.Anchor,
                  isActive && styles.active,
                  depth === 1 && styles.child
                )}
              >
                {text}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

  return null;
}
