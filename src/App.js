import './App.css';
import React from 'react';
import SensorChart from './SensorChart';

function App() {
  return (
    <>
      <div className="App">
        <div className="doughnut__container"><SensorChart sensorNumber={1} /></div>
     
        <div className="doughnut__container"> <SensorChart sensorNumber={2} /></div>
      </div>
    </>
  );
}

export default App;
