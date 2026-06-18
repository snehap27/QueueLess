import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerDashboard from "./pages/OwnerDashboard";
import JoinQueue from "./pages/JoinQueue";
import TokenPage from "./pages/TokenPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/owner/dashboard" element={<OwnerDashboard />} />
        <Route path="/customer/join" element={<JoinQueue />} />
        <Route path="/customer/token/:id" element={<TokenPage />} />
      </Route>
    </Routes>
  );
}

export default App;
