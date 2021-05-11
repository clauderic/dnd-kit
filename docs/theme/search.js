import React, {useMemo, useCallback, useRef, useState, useEffect} from 'react';
import matchSorter from 'match-sorter';
import cn from 'classnames';
import {useRouter} from 'next/router';
import Link from 'next/link';

const Item = ({title, active, href, onMouseOver, search}) => {
  const highlight = title.toLowerCase().indexOf(search.toLowerCase());

  return (
    <Link href={href}>
      <a className="block no-underline" onMouseOver={onMouseOver}>
        <li className={cn('p-2', {active})}>
          {title.substring(0, highlight)}
          <span className="highlight">
            {title.substring(highlight, highlight + search.length)}
          </span>
          {title.substring(highlight + search.length)}
        </li>
      </a>
    </Link>
  );
};

const UP = true;
const DOWN = false;

const Search = ({directories}) => {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState(0);
  const input = useRef(null);

  const results = useMemo(() => {
    if (!search) return [];

    // Will need to scrape all the headers from each page and search through them here
    // (similar to what we already do to render the hash links in sidebar)
    // We could also try to search the entire string text from each page
    return matchSorter(directories, search, {keys: ['title']});
  }, [search]);

  const moveActiveItem = (up) => {
    const position = active + (up ? -1 : 1);
    const {length} = results;

    // Modulo instead of remainder,
    // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
    const next = (position + length) % length;
    setActive(next);
  };

  const handleKeyDown = useCallback(
    (e) => {
      const {key, ctrlKey} = e;

      if ((ctrlKey && key === 'n') || key === 'ArrowDown') {
        e.preventDefault();
        moveActiveItem(DOWN);
      }

      if ((ctrlKey && key === 'p') || key === 'ArrowUp') {
        e.preventDefault();
        moveActiveItem(UP);
      }

      if (key === 'Enter') {
        router.push(results[active].route);
      }
    },
    [active, results, router]
  );

  useEffect(() => {
    setActive(0);
  }, [search]);

  useEffect(() => {
    const inputs = ['input', 'select', 'button', 'textarea'];

    const down = (e) => {
      if (
        document.activeElement &&
        inputs.indexOf(document.activeElement.tagName.toLowerCase()) === -1
      ) {
        if (e.key === '/') {
          e.preventDefault();
          input.current.focus();
        } else if (e.key === 'Escape') {
          setShow(false);
        }
      }
    };

    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  const renderList = show && results.length > 0;

  return (
    <div className="nextra-search relative w-full md:w-1/2 mx-auto">
      {renderList && (
        <div className="search-overlay z-1" onClick={() => setShow(false)} />
      )}
      <label className="flex items-center px-2 border rounded focus-within:ring">
        <svg
          width="24"
          height="24"
          fill="none"
          class="text-gray-400 group-hover:text-gray-500 transition-colors duration-200"
        >
          <path
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></path>
        </svg>
        <input
          onChange={(e) => {
            setSearch(e.target.value);
            setShow(true);
          }}
          className="appearance-none py-2 px-3 leading-tight focus:outline-none w-full"
          type="search"
          placeholder="Search documentation"
          onKeyDown={handleKeyDown}
          onFocus={() => setShow(true)}
          ref={input}
        />
      </label>
      {renderList && (
        <ul className="shadow-md list-none p-0 m-0 absolute left-0 md:right-0 rounded mt-1 border top-100 divide-y z-2">
          {results.map((res, i) => {
            return (
              <Item
                key={`search-item-${i}`}
                title={res.title}
                href={res.route}
                active={i === active}
                search={search}
                onMouseOver={() => setActive(i)}
              />
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Search;
