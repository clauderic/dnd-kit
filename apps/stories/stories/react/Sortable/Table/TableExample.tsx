import React, {useRef, useState} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';

import {Handle} from '../../components/index.ts';

type ColumnKey = 'name' | 'role' | 'email' | 'status';

interface Column {
  id: ColumnKey;
  label: string;
}

const initialColumns: Column[] = [
  {id: 'name', label: 'Name'},
  {id: 'role', label: 'Role'},
  {id: 'email', label: 'Email'},
  {id: 'status', label: 'Status'},
];

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
  sortableColumns?: boolean;
}

export function TableExample({dragHandle = true, sortableColumns = false}: Props) {
  const [rows, setRows] = useState(initialData);
  const [columns, setColumns] = useState(initialColumns);

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        setRows((rows) => move(rows, event));
        setColumns((columns) => move(columns, event));
      }}
    >
      <div style={{padding: '0 30px'}}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {dragHandle ? <th style={thStyles} /> : null}
              {columns.map((column, index) =>
                sortableColumns ? (
                  <SortableColumn key={column.id} column={column} index={index} />
                ) : (
                  <th key={column.id} style={thStyles}>{column.label}</th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <SortableRow
                key={row.id}
                row={row}
                columns={columns}
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

interface SortableColumnProps {
  column: Column;
  index: number;
}

function SortableColumn({column, index}: SortableColumnProps) {
  const {ref, isDragging} = useSortable({
    id: column.id,
    index,
    modifiers: [RestrictToHorizontalAxis],
  });

  return (
    <th
      ref={ref}
      style={{
        ...thStyles,
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.5 : undefined,
        backgroundColor: isDragging ? '#f1f5f9' : undefined,
      }}
    >
      {column.label}
    </th>
  );
}

interface SortableRowProps {
  row: RowData;
  columns: Column[];
  index: number;
  dragHandle?: boolean;
}

function SortableRow({row, columns, index, dragHandle}: SortableRowProps) {
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
      {columns.map((column) => (
        <td key={column.id} style={tdStyles}>
          {column.id === 'status' ? (
            <span style={getStatusStyles(row[column.id])}>{row[column.id]}</span>
          ) : (
            row[column.id]
          )}
        </td>
      ))}
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
