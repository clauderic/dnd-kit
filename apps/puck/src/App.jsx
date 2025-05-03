// App.jsx
import {Puck} from '@measured/puck';
import '@measured/puck/puck.css';

const config = {
  components: {
    Card: {
      inline: true,
      render: ({puck}) => {
        return (
          <div
            style={{
              alignItems: 'center',
              background: 'white',
              border: '1px solid black',
              borderRadius: 8,
              display: 'flex',
              justifyContent: 'center',
              flexGrow: 1,
              padding: 24,
              height: 128,
            }}
            ref={puck.dragRef} // Use inline ref so we can use flexGrow
          >
            Card
          </div>
        );
      },
    },
    Container: {
      fields: {
        Content: {
          type: 'slot', // NB This is triggering DropZone deprecation warning when it shouldn't. Puck bug.
        },
      },
      render: ({Content}) => {
        return (
          <div style={{background: '#eee', padding: 32}}>
            <Content style={{display: 'flex', flexWrap: 'wrap', gap: 16}} />
          </div>
        );
      },
    },
  },
};

const App = () => {
  return <Puck config={config} data={{}} />;
};

export default App;
