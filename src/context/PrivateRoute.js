import { Outlet, Navigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useContext } from "react";

const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext);
  // console.log(currentUser.displayName.slice(-1));
  console.log(currentUser.uid);

  if (currentUser) {
    return <Outlet />;
    // } else if (currentUser) {
    //   return <Navigate to="/chat" />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
