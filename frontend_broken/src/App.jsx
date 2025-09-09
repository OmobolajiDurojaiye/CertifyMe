import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center p-8">
      <div className="flex justify-center items-center gap-8 mb-8">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={viteLogo}
            className="h-24 p-2 transition-all duration-300 hover:drop-shadow-[0_0_2em_#646cffaa]"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img
            src={reactLogo}
            className="h-24 p-2 transition-all duration-300 logo react hover:drop-shadow-[0_0_2em_#61dafbaa]"
            alt="React logo"
          />
        </a>
      </div>

      <h1 className="text-5xl font-bold text-slate-900">Vite + React</h1>

      <div className="p-8 my-8">
        <button
          onClick={() => setCount((count) => count + 1)}
          className="rounded-lg border border-transparent px-6 py-3 text-base font-medium bg-primary text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          count is {count}
        </button>
        <p className="mt-4 text-slate-500">
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p className="text-slate-400">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
