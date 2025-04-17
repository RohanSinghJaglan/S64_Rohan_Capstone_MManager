// App.jsx
import React from 'react';
import Header from './components/Header'; // <- import the Header component

const App = () => {
  return (
    <div>
      <Header /> {/* <- use the Header component here */}
      <p>This is the main content of the app.</p>
    </div>
  );
};

export default App;
