import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import React, { useState, useContext, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";

const Navbar = () => {
  const { currentUser } = useContext(AuthContext);
  const [noOfNotifications, setNoOfNotifications] = useState(0);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const docRef = doc(db, "notifications", currentUser.uid);
      const unSub = onSnapshot(docRef, (doc) => {
        doc.exists() && setNoOfNotifications(doc.data().notifications.length);
      });

      return () => {
        unSub();
      };
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        // An error occurred
        console.error("Logout error:", error);
      });
  };

  useEffect(() => {
    if (currentUser) {
      fetchData(); // this is giving errors
    } // Call the fetchData function when the component mounts
  }, [currentUser]);

  return (
    // <div style={{ background: "cyan", display: "flex" }}>
    //   <h1>Hi {currentUser?.displayName} </h1>
    //   {/* <button onClick={fetchData}>test</button> */}
    //   <button onClick={() => navigate("/notifications")}>
    //     {noOfNotifications} Notification
    //   </button>

    //   <button onClick={() => signOut(auth)}>Sign Out</button>
    // </div>

    <div className="navbar bg-base-100">
      <div className="navbar-start">
        {currentUser && (
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h7"
                />
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to={"/home"}>
                  <a>Homepage</a>
                </Link>
              </li>
              <li>
                <Link to={"/my-travels"}>
                  <a>My Travels</a>
                </Link>
              </li>
              <li>
                <Link to={"/chat"}>
                  <a>Chats</a>
                </Link>
              </li>
            </ul>
          </div>
        )}

        <button className="btn btn-ghost btn-circle"></button>
      </div>
      <div className="navbar-center">
        <a className="btn btn-ghost text-xl">
          {" "}
          {currentUser ? (
            <Link to="/home">
              <>
                <div class="avatar flex items-center gap-2 ">
                  <div class="w-10   rounded-full">
                    <img src={currentUser.photoURL} />
                  </div>
                  {currentUser.displayName}
                </div>
              </>
            </Link>
          ) : (
            "TravelBuddy"
          )}{" "}
        </a>
      </div>

      <div className="navbar-end">
        <button className="btn btn-ghost btn-circle"></button>

        {currentUser && (
          <>
            <button
              className="btn btn-ghost btn-circle tooltip flex items-center tooltip-bottom "
              data-tip="logout"
              onClick={handleLogout}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 16L21 12M21 12L17 8M21 12L3 12" />
              </svg>
            </button>

            <Link to={"/notifications"}>
              <button
                className="btn btn-ghost btn-circle tooltip tooltip-bottom mr-4"
                data-tip="notifications"
              >
                <div className="indicator">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="badge badge-xs badge-primary p-2 indicator-item">
                    {noOfNotifications}
                  </span>
                </div>
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
