import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Register from "./page/auth/register";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Navigate to="/register" replace />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
