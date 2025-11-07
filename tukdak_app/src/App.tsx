import { PingTest } from "./components";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>TukDak API Test</h1>
        <p>Testing API connection with clean architecture</p>
      </header>
      <main className="app-main">
        <PingTest />
      </main>
    </div>
  );
}

export default App;
