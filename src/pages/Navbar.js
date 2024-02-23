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
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    if (currentUser) {
      fetchData(); // this is giving errors
    } // Call the fetchData function when the component mounts
  }, [currentUser]);

  return (
    <div style={{ background: "cyan", display: "flex" }}>
      <h1>Hi {currentUser.displayName} </h1>
      {/* <button onClick={fetchData}>test</button> */}
      <button onClick={() => navigate("/notifications")}>
        {noOfNotifications} Notification
      </button>
    </div>
  );
};

export default Navbar;
