import "./App.css";
import { AuthContext } from "./context/AuthContext";
import { useContext } from "react";
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

function App() {
  const { currentUser } = useContext(AuthContext);

  const ProtectedRoute = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/login" />;
    }
  };

  return (
    <BrowserRouter>
      <Navbar />
      {/* <Home /> */}
      <Routes>
        {/* <Route
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="home"
          element={
            // <ProtectedRoute>
            <Home />
            // </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="my-travels" element={<AddTravelForm />} />
        <Route path="chats/:chatId" element={<Chats />} />
        <Route path="/account/:userId" element={<Account />} />

        <Route exact path="notifications" element={<Notifications />} />
        <Route path="temp" element={<Temp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
