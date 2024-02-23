import React, { useState, useContext, useEffect } from "react";
import { realtimeDB, db } from "../firebaseConfig";
import {
  ref,
  get,
  orderByValue,
  equalTo,
  query,
  orderByChild,
} from "firebase/database";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuid } from "uuid";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function SearchTraveller() {
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [travelers, setTravelers] = useState([]);
  const { currentUser } = useContext(AuthContext);
  const [userCompanions, setUserCompanions] = useState([]);
  const navigate = useNavigate();

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   // Here you would handle form submission (e.g., pass form data to a parent component)
  //   console.log("Destination:", destination);
  //   console.log("Date:", date);
  //   console.log("Time:", time);

  //   const queryRef = query(
  //     ref(realtimeDB, "current-travelers")
  //     //   equalTo("andheri")
  //   );

  //   const trips = [];
  //   get(queryRef)
  //     .then(async (snapshot) => {
  //       if (snapshot.exists()) {
  //         const data = snapshot.val();
  //         const companions = await getCompanionsOfUser();

  //         Object.keys(data).forEach((userId) => {
  //           const userData = data[userId];
  //           // Loop through each trip for the user
  //           Object.keys(userData).forEach((tripId) => {
  //             const tripData = userData[tripId];
  //             if (companions.includes(tripData.userId)) {
  //               tripData["companion"] = true;
  //             } else {
  //               tripData["companion"] = false;
  //             }
  //             // Check if the trip matches the destination and date
  //             if (
  //               tripData.destination === destination &&
  //               tripData.date === date &&
  //               tripData.userId != currentUser.uid
  //             ) {
  //               trips.push(tripData);
  //             }
  //           });
  //         });
  //       }
  //     })
  //     .catch((error) => {
  //       // Handle any errors
  //       console.error("Error getting data:", error);
  //     });

  //   console.log(trips);
  //   setTravelers(trips);
  // };

  const getCompanionsOfUser = async () => {
    const docRef = doc(db, "companions", currentUser.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().companions;
    } else {
      // docSnap.data() will be undefined in this case
      console.log("No such document!");
    }
  };

  const chatWithUser = async (userId) => {
    const combinedId =
      currentUser.uid > userId
        ? currentUser.uid + userId
        : userId + currentUser.uid;
    console.log(combinedId);
    try {
      const res = await getDoc(doc(db, "chats", combinedId));

      if (!res.exists()) {
        console.log("here");
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        // const senderDocumentRef = doc(db, "notifications", userId);
        // await updateDoc(senderDocumentRef, {
        //   notifications: arrayUnion({
        //     notificationId: uuid(),
        //     senderId: currentUser.uid,
        //     senderName: currentUser.displayName,
        //     senderProfilePhoto: currentUser.photoURL,
        //     receiverId: senderId,
        //     date: Timestamp.now(),
        //     status: "chat-request",
        //   }),
        // });

        //create user chats
        // there is an issue here
        // await updateDoc(doc(db, "userChats", currentUser.uid), {
        //   [combinedId + ".userInfo"]: {
        //     uid: userId,
        //   },
        //   [combinedId + ".date"]: serverTimestamp(),
        // });

        // await updateDoc(doc(db, "userChats", userId), {
        //   [combinedId + ".userInfo"]: {
        //     uid: currentUser.uid,
        //   },
        //   [combinedId + ".date"]: serverTimestamp(),
        // });

        console.log("made");
      }
      navigate(`/chats/${combinedId}`);
    } catch (err) {
      console.log(err);
    }
  };

  const sendCompanionRequest = async (userId) => {
    try {
      //create a friend request
      // const senderData = await fetchLoggedInUserDetails(currentUser.uid);

      // console.log(senderData);

      await updateDoc(doc(db, "notifications", userId), {
        notifications: arrayUnion({
          notificationId: uuid(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePhoto: currentUser.photoURL,
          receiverId: userId,
          date: Timestamp.now(),
          status: "pending",
        }),
      });

      alert("Connection request sent !");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const queryRef = query(
      ref(realtimeDB, "current-travelers")
      //   equalTo("andheri")
    );

    const trips = [];
    get(queryRef)
      .then(async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const companions = await getCompanionsOfUser();

          Object.keys(data).forEach((userId) => {
            const userData = data[userId];
            // Loop through each trip for the user
            Object.keys(userData).forEach((tripId) => {
              const tripData = userData[tripId];
              if (companions.includes(tripData.userId)) {
                tripData["companion"] = true;
              } else {
                tripData["companion"] = false;
              }
              // Check if the trip matches the destination and date
              if (
                tripData.destination === destination &&
                tripData.date === date &&
                tripData.userId != currentUser.uid
              ) {
                trips.push(tripData);
              }
            });
          });
          // Update the travelers state here
          setTravelers(trips);
        }
      })
      .catch((error) => {
        // Handle any errors
        console.error("Error getting data:", error);
      });
  }, [destination, date, currentUser.uid]);
  return (
    <div>
      {currentUser.uid}
      <h1>Find a Travel Buddy</h1>
      <form>
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

        <label htmlFor="time">Time:</label>
        <input
          type="time"
          id="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
        <br />

        <button type="submit">Search</button>
      </form>

      <h2>Travelers List</h2>
      {Object.keys(travelers).map((userId) => {
        // returnUserDetails(userId);

        return (
          <div>
            {travelers.map((trip, index) => (
              <div key={index} className="trip">
                <p>Date: {trip.date}</p>
                <p>Destination: {trip.destination}</p>
                <p>Gender: {trip.gender}</p>
                <p>Leaving Time: {trip.leavingTime}</p>
                <p>Name: {trip.name}</p>
                <Link to={`/account/${trip.userId}`}>
                  {" "}
                  <img src={trip.profilePhoto} className="profilePic" />
                </Link>

                {trip.companion === true ? (
                  <button onClick={() => chatWithUser(trip.userId)}>
                    Chat with {trip.name}
                  </button>
                ) : (
                  <button onClick={() => sendCompanionRequest(trip.userId)}>
                    Connect with {trip.name}
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default SearchTraveller;
