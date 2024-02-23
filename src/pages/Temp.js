import React, { useState, useEffect } from "react";
import { realtimeDB } from "../firebaseConfig";
import { ref, set, push, onValue, off } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { fetchLoggedInUserDetails } from "../FirebaseUtility.js/userUtils";

const Temp = () => {
  const [travels, setTravels] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const dbRef = ref(realtimeDB, "current-travelers");
    const trips = [];
    const handleSnapshot = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTravels(data);
        Object.keys(data).forEach((userId) => {
          const userData = data[userId];
          // Loop through each trip for the user
          Object.keys(userData).forEach((tripId) => {
            const tripData = userData[tripId];
            // Check if the trip matches the destination and date
            if (
              tripData.destination === "Bandra" &&
              tripData.date === "2024-02-22" &&
              tripData.userId != currentUser.uid
            ) {
              trips.push(tripData);
            }
          });
        });
      } else {
        setTravels([]);
      }

      console.log(trips);
    };

    const handleError = (error) => {
      console.error("Error fetching data:", error);
    };

    onValue(dbRef, handleSnapshot, { errorCallback: handleError });

    return () => {
      off(dbRef, handleSnapshot);
    };
  }, [currentUser]);
  return <div>Temp</div>;
};

export default Temp;
