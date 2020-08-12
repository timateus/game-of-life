import React, { useState, useCallback, useRef } from 'react';
import useMeasure from "react-use-measure";
import chroma from "chroma-js";
import './App.css';

// Following this tut by Ben Awad
// https://youtu.be/DvVt11mPuM0

const numRows = 80;
const numCols = 80;

const cellSize = 10;
const rowColorScale = chroma.scale(['1cddd4', 'd563a1']);
const colColorScale = chroma.scale(['1cddd4', '45abc3']);

const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [-1, -1],
  [-1, 0],
  [-1, 1],
]

const setMatrix = f => {
  let matrix = [];
  for (let i = 0; i < numRows; i++) {
    let row = []
    for (let k = 0; k < numCols; k++) {
      row.push(f());
    }
    matrix.push(row);
  }
return matrix;
}


const calculateNextMatrixState = (matrix) => {
  const newGrid = JSON.parse(JSON.stringify(matrix));
  matrix.forEach((row, i) => {
    row.forEach((col, k) => {
      let neightbours = 0;
      operations.forEach(([x, y]) => {
        const newI = (i + x + numRows) % numRows;
        const newK = (k + y + numCols) % numCols;
        if (newI >= 0 && newI < numRows && newK >= 0 && newK < numCols) {
          neightbours += matrix[newI][newK]
        }
      });

      if (neightbours < 2 || neightbours > 3) {
        newGrid[i][k] = 0;
      }
      else if (matrix[i][k] === 0 && neightbours === 3) {
        newGrid[i][k] = 1; 
      }

    })
  })
  return newGrid;
}

function App() {
  const [refDiv, { width, height }] = useMeasure();

  const smallestSize = width < height ? width : height;
  const size = smallestSize / numRows;
  const actualNumCols = Math.floor(width / size);

  const [grid, setGrid] = useState(() => setMatrix(() => Math.random() > 0.9 ? 1 : 0));
  const [running, setRunning] = useState(false);

  const runningRef = useRef(running);
  runningRef.current = running;

  const clear = () => {
    setGrid(setMatrix(() => 0));
  }

  const initializeRandom = () => {
    setGrid(setMatrix(() => Math.random() > 0.9 ? 1 : 0));
  }


  const runSimulation = useCallback(() => {
    if (!runningRef.current) {
      return;
    };

    setGrid(g => calculateNextMatrixState(g));

    setTimeout(runSimulation, 200);

  }, [])


  return (
    <div 
    ref={refDiv}
    style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <button
        onClick={() => {
          setRunning(!running);
          runningRef.current = true;
          runSimulation();
        }}
      >
        {running ? "stop" : "start"}
      </button>
      <button
        onClick={initializeRandom}>
        random
      </button>
      <button
        onClick={clear}>
        clear
      </button>
      <div 
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${numCols}, ${size}px)`
            
        }}>
        {
          grid.map((row, k) => 
            row.map((col, i) => 
            <div
              key={`${i}=${k}`}
              onClick={() => {
                const newGrid = JSON.parse(JSON.stringify(grid));
                newGrid[i][k] ^= 1;
                setGrid(newGrid);

              }}
              onDrag={() => {
                const newGrid = JSON.parse(JSON.stringify(grid));
                newGrid[i][k] ^= 1;
                setGrid(newGrid);

              }}
              style={{
                width: size,
                height: size,
                backgroundColor: grid[i][k] ? chroma.blend(rowColorScale(i / numRows), colColorScale(k / numCols), 'lighten') : undefined,
                border: "solid 0px black"
              }} 
            />
          ))
        }
      </div>
    </div>
  );
}

export default App;
