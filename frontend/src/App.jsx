import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex justify-center items-center">
      {/* <Login /> */}
      <Home />
    </div>
  );
}

export default App;
