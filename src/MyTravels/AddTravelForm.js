import React, { useState, useEffect } from "react";
import { realtimeDB } from "../firebaseConfig";
import { ref, set, push, onValue, off } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { fetchLoggedInUserDetails } from "../FirebaseUtility.js/userUtils";

function AddTravelForm() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [leavingTime, setLeavingTime] = useState("");
  const [travels, setTravels] = useState([]);
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const dbRef = ref(realtimeDB, "current-travelers/" + currentUser.uid);

    const handleSnapshot = (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTravels(data);
      } else {
        setTravels([]);
      }
    };

    const handleError = (error) => {
      console.error("Error fetching data:", error);
    };

    onValue(dbRef, handleSnapshot, { errorCallback: handleError });

    return () => {
      off(dbRef, handleSnapshot);
    };
  }, [currentUser]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const dateObj = new Date(date);

    const userDetails = await fetchLoggedInUserDetails(currentUser.uid);

    await push(ref(realtimeDB, "current-travelers/" + currentUser.uid), {
      destination,
      date: date,
      leavingTime: leavingTime,
      userId: currentUser.uid,
      name: userDetails.name,
      gender: userDetails.gender,
      profilePhoto: userDetails.photoURL,
    });
  };

  return (
    <div>
      <h2>Add a New Travel Plan</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="destination">Destination:</label>
        <input
          type="text"
          id="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          required
        />
        <br />
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <br />
        <label htmlFor="leavingTime">Leaving Time:</label>
        <input
          type="time"
          id="leavingTime"
          value={leavingTime}
          onChange={(e) => setLeavingTime(e.target.value)}
          required
        />
        <br />
        <button type="submit">Add Trip</button>
      </form>

      {Object.values(travels).map((travel, id) => {
        return <div key={id}>{travel.destination}</div>;
      })}
    </div>
  );
}

export default AddTravelForm;
