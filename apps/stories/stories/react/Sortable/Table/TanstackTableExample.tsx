import React, {useMemo, useRef, useState} from 'react';
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {RestrictToHorizontalAxis} from '@dnd-kit/abstract/modifiers';
import {DragDropProvider} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';
import {move} from '@dnd-kit/helpers';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  Header,
  Row as TableRow,
} from '@tanstack/react-table';

import {Handle} from '../../components/index.ts';

interface RowData {
  id: UniqueIdentifier;
  name: string;
  role: string;
  email: string;
  status: string;
}

const initialData: RowData[] = [
  {
    id: 1,
    name: 'Alice Johnson',
    role: 'Engineer',
    email: 'alice@example.com',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Bob Smith',
    role: 'Designer',
    email: 'bob@example.com',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Charlie Brown',
    role: 'Manager',
    email: 'charlie@example.com',
    status: 'Away',
  },
  {
    id: 4,
    name: 'Diana Ross',
    role: 'Engineer',
    email: 'diana@example.com',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Eve Williams',
    role: 'Designer',
    email: 'eve@example.com',
    status: 'Offline',
  },
  {
    id: 6,
    name: 'Frank Miller',
    role: 'Engineer',
    email: 'frank@example.com',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Grace Lee',
    role: 'Manager',
    email: 'grace@example.com',
    status: 'Away',
  },
  {
    id: 8,
    name: 'Hank Davis',
    role: 'Designer',
    email: 'hank@example.com',
    status: 'Active',
  },
];

const initialColumnOrder = ['name', 'role', 'email', 'status'];

export function TanstackTableExample() {
  const [data, setData] = useState(initialData);
  const [columnOrder, setColumnOrder] = useState<string[]>(initialColumnOrder);

  const initialOrder = useRef({
    columnOrder,
    data,
  });

  const columns = useMemo<ColumnDef<RowData>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        header: 'Name',
      },
      {
        id: 'role',
        accessorKey: 'role',
        header: 'Role',
      },
      {
        id: 'email',
        accessorKey: 'email',
        header: 'Email',
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const value = info.getValue<string>();
          return <span style={getStatusStyles(value)}>{value}</span>;
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DragDropProvider
      onDragStart={() => {
        initialOrder.current = {
          columnOrder,
          data,
        };
      }}
      onDragOver={(event) => {
        const {source} = event.operation;

        if (source?.type === 'column') {
          setColumnOrder((order) => move(order, event));
        } else {
          setData((rows) => move(rows, event));
        }
      }}
      onDragEnd={(event) => {
        if (event.canceled) {
          setColumnOrder(initialOrder.current.columnOrder);
          setData(initialOrder.current.data);
        }
      }}
    >
      <div
        style={{
          maxWidth: 800,
          marginInline: 'auto',
          overflow: 'hidden',
          borderRadius: 8,
          border: '1px solid #e2e8f0',
        }}
      >
        <table style={tableStyles}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th style={thStyles} />
                {headerGroup.headers.map((header, index) => (
                  <SortableHeader
                    key={header.id}
                    header={header}
                    index={index}
                  />
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <SortableRow
                key={row.id}
                row={row}
                index={index}
                lastRow={index === table.getRowModel().rows.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </DragDropProvider>
  );
}

interface SortableHeaderProps {
  header: Header<RowData, unknown>;
  index: number;
}

function SortableHeader({header, index}: SortableHeaderProps) {
  const {ref, isDragging} = useSortable({
    id: header.column.id,
    index,
    type: 'column',
    accept: 'column',
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
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  );
}

interface SortableRowProps {
  row: TableRow<RowData>;
  index: number;
  lastRow?: boolean;
}

function SortableRow({row, index, lastRow}: SortableRowProps) {
  const {ref, handleRef, isDragging} = useSortable({
    id: row.original.id,
    index,
    type: 'row',
    accept: 'row',
  });

  return (
    <tr
      ref={ref}
      style={{
        ...trStyles,
        boxShadow: isDragging
          ? '0 0 0 1px rgba(63, 63, 68, 0.05), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
          : undefined,
        opacity: isDragging ? 0.9 : undefined,
      }}
    >
      <td style={lastRow ? tdLastRowStyles : tdStyles}>
        <Handle ref={handleRef} />
      </td>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id} style={lastRow ? tdLastRowStyles : tdStyles}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

const tableStyles: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
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

const tdLastRowStyles: React.CSSProperties = {
  padding: '12px 16px',
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
