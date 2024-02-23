import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchLoggedInUserDetails } from "../FirebaseUtility.js/userUtils";
import {
  onSnapshot,
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { realtimeDB, db } from "../firebaseConfig";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuid } from "uuid";

const Account = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchLoggedInUserDetails(userId);
        setUserData(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchData(); // Call fetchData function when component mounts
  }, [userId, rating]); // useEffect will re-run whenever userId changes

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const avgRatings = fetchLoggedInUserDetails(userId).avgRatings;
    // console.log(avgRatings); LEFT TO IMPLEMENT

    await updateDoc(doc(db, "users", userId), {
      ratings: arrayUnion({
        id: uuid(),
        comment,
        rating,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderProfilePhoto: currentUser.photoURL,
        date: Timestamp.now(),
      }),
    });

    // Reset the form
    setRating(0);
    setComment("");
  };

  if (!userData) {
    return <div>Loading...</div>; // Render loading state while data is being fetched
  }

  return (
    <div>
      <h1>User Details</h1>
      <p>Name: {userData.name}</p>
      <form onSubmit={handleSubmit}>
        <div>
          <p>Rating:</p>
          {[...Array(5)].map((_, index) => (
            <span
              key={index}
              onClick={() => setRating(index + 1)}
              style={{
                cursor: "pointer",
                color: index < rating ? "gold" : "gray",
              }}
            >
              ★
            </span>
          ))}
        </div>
        <br />
        <label>
          Comment:
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Submit</button>
      </form>

      <div>
        {userData.ratings.map((data) => {
          return (
            <div>
              {data.rating} - {data.comment}{" "}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Account;
