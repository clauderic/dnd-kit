import React from 'react';

// https://www.notion.so/Callout-blocks-5b2638247b54447eb2e21145f97194b0
export function Callout({
  children,
  background = 'bg-gray-200 dark:bg-gray-800 dark:text-gray-200',
  emoji = '💡',
}) {
  return (
    <div className={`${background} flex rounded-lg callout mt-6`}>
      <div
        className="p-4 pr-2 select-none text-xl"
        style={{
          fontFamily:
            '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
        }}
      >
        {emoji}
      </div>
      <div className="pl-2 p-4">{children}</div>
    </div>
  );
}
