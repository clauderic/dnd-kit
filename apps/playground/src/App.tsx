import {useState} from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const {ref} = useSortable({id: '1', index: 1});
  const {ref: ref2} = useSortable({id: '2', index: 2});

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button ref={ref} onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button ref={ref2} onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
