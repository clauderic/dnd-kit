import React, {useRef, useState} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

import {Handle} from '../../components/index.ts';

interface RowData {
  id: UniqueIdentifier;
  name: string;
  role: string;
  email: string;
  status: string;
}

const initialData: RowData[] = [
  {id: 1, name: 'Alice Johnson', role: 'Engineer', email: 'alice@example.com', status: 'Active'},
  {id: 2, name: 'Bob Smith', role: 'Designer', email: 'bob@example.com', status: 'Active'},
  {id: 3, name: 'Charlie Brown', role: 'Manager', email: 'charlie@example.com', status: 'Away'},
  {id: 4, name: 'Diana Ross', role: 'Engineer', email: 'diana@example.com', status: 'Active'},
  {id: 5, name: 'Eve Williams', role: 'Designer', email: 'eve@example.com', status: 'Offline'},
  {id: 6, name: 'Frank Miller', role: 'Engineer', email: 'frank@example.com', status: 'Active'},
  {id: 7, name: 'Grace Lee', role: 'Manager', email: 'grace@example.com', status: 'Away'},
  {id: 8, name: 'Hank Davis', role: 'Designer', email: 'hank@example.com', status: 'Active'},
];

interface Props {
  dragHandle?: boolean;
}

export function TableExample({dragHandle = true}: Props) {
  const [rows, setRows] = useState(initialData);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setRows((rows) => move(rows, event));
      }}
    >
      <div style={{padding: '0 30px'}}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {dragHandle ? <th style={thStyles} /> : null}
              <th style={thStyles}>Name</th>
              <th style={thStyles}>Role</th>
              <th style={thStyles}>Email</th>
              <th style={thStyles}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <SortableRow
                key={row.id}
                row={row}
                index={index}
                dragHandle={dragHandle}
              />
            ))}
          </tbody>
        </table>
      </div>
    </DragDropProvider>
  );
}

interface SortableRowProps {
  row: RowData;
  index: number;
  dragHandle?: boolean;
}

function SortableRow({row, index, dragHandle}: SortableRowProps) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const {isDragging} = useSortable({
    id: row.id,
    index,
    element,
    handle: dragHandle ? handleRef : undefined,
  });

  return (
    <tr
      ref={setElement}
      style={{
        ...trStyles,
        boxShadow: isDragging ? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)' : undefined,
        opacity: isDragging ? 0.9 : undefined,
      }}
    >
      {dragHandle ? (
        <td style={tdStyles}>
          <Handle ref={handleRef} />
        </td>
      ) : null}
      <td style={tdStyles}>{row.name}</td>
      <td style={tdStyles}>{row.role}</td>
      <td style={tdStyles}>{row.email}</td>
      <td style={tdStyles}>
        <span style={getStatusStyles(row.status)}>{row.status}</span>
      </td>
    </tr>
  );
}

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: 'system-ui, sans-serif',
  fontSize: 14,
};

const thStyles: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 16px',
  borderBottom: '2px solid #e2e8f0',
  color: '#64748b',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const trStyles: React.CSSProperties = {
  backgroundColor: '#fff',
};

const tdStyles: React.CSSProperties = {
  padding: '12px 16px',
  borderBottom: '1px solid #e2e8f0',
};

function getStatusStyles(status: string): React.CSSProperties {
  const colors: Record<string, {bg: string; text: string}> = {
    Active: {bg: '#dcfce7', text: '#166534'},
    Away: {bg: '#fef9c3', text: '#854d0e'},
    Offline: {bg: '#f1f5f9', text: '#475569'},
  };

  const {bg, text} = colors[status] ?? colors.Offline;

  return {
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 500,
    backgroundColor: bg,
    color: text,
  };
}
