import { Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

import Home from "@/pages/Home";
import FindRepairer from "@/pages/FindRepairer";
import RepairerProfile from "@/pages/RepairerProfile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/repairers" element={<FindRepairer />} />
        <Route path="/repairer/:slug" element={<RepairerProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;