import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddTravelForm from "./MyTravels/AddTravelForm";
import Chats from "./pages/Chats";
import Navbar from "./pages/Navbar";
import Notifications from "./pages/Notifications";
import Temp from "./pages/Temp";
import Account from "./pages/Account";
import PrivateRoute from "./context/PrivateRoute";
import ChatHome from "./pages/ChatHome";
import Landing from "./pages/Landing";
import AuthSpace from "./pages/AuthSpace";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="" element={<Landing />} />
        <Route path="auth-space" element={<AuthSpace />} />

        <Route element={<PrivateRoute />}>
          <Route path="home" element={<Home />} />
          <Route path="my-travels" element={<AddTravelForm />} />
          <Route path="chats/:chatId" element={<Chats />} />
          <Route path="/account/:userId" element={<Account />} />
          <Route exact path="notifications" element={<Notifications />} />
          <Route path="/chat" element={<ChatHome />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
