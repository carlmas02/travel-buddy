import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserDetails } from "../FirebaseUtility.js/userUtils";
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
        const data = await fetchUserDetails(userId);
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

    // const avgRatings = fetchUserDetails(userId).avgRatings;
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
      <div className="bg-white rounded-lg shadow-lg p-6 flex items-center w-[90%] md:w-1/2  m-auto mt-10">
        <div className="flex-shrink-0">
          <img
            src={userData.photoURL}
            // alt={name}
            className="w-36 h-36 rounded-full border-4 object-cover border-yellow-500"
          />
        </div>
        <div className="ml-6">
          <h2 className="text-2xl font-semibold">{userData.name}</h2>
          <div className="flex items-center text-gray-600 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm5 8a5 5 0 1 1-10 0 5 5 0 0 1 10 0z"
              />
            </svg>
            <span>{userData.gender}</span>
            <span className="mx-2">|</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0zm-7-6a1 1 0 0 1 1 1v4a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 10a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
              />
            </svg>
            <span>{userData.age}</span>
            <span className="mx-2">|</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M13 2a1 1 0 0 1 1 1v2h1a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1h6zM9 2H8v2h1V2zm3 0h-1v2h1V2zm2 5H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1z"
              />
            </svg>
            <span>{userData.rideCompleted} rides completed</span>
          </div>
          <div className="flex items-center mt-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-yellow-500 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18.39 9.027a.75.75 0 0 0-.678-.747l-5.31-.387-2.098-4.804a.75.75 0 0 0-1.344 0l-2.098 4.804-5.31.387a.75.75 0 0 0-.418 1.285l3.856 3.553-1.023 5.255a.75.75 0 0 0 1.088.816L10 15.763l4.844 2.535a.75.75 0 0 0 1.088-.816l-1.023-5.255 3.856-3.553a.75.75 0 0 0 .24-.538z"
              />
            </svg>
            <span className="text-lg font-semibold">3 stars</span>
          </div>
        </div>
      </div>

      <h1 className="text-xl text-center m-3">Ratings and Reviews </h1>

      {userId != currentUser.uid && (
        <div className="  flex justify-center ">
          <div className="bg-white  rounded-lg shadow-md p-6 w-full max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Rating:
                </label>
                <div>
                  {[...Array(5)].map((_, index) => (
                    <span
                      key={index}
                      onClick={() => setRating(index + 1)}
                      className={`text-xl cursor-pointer ${
                        index < rating ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="comment"
                >
                  Comment:
                </label>
                <textarea
                  id="comment"
                  className="border border-gray-300 rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-blue-500"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div>
        {userData.ratings.map((data) => {
          console.log(userData.ratings);
          return (
            <div className="flex items-center justify-center ">
              <div className="">
                <img
                  className="h-24 w-24 object-cover md:w-24"
                  src={data.senderProfilePhoto}
                  // alt={name}
                />
              </div>
              <div className="p-8 w-[70vw] md:w-[30vw] ">
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                  {data.senderName}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-5 w-5 ${
                        index < data.rating
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18.39 9.027a.75.75 0 0 0-.678-.747l-5.31-.387-2.098-4.804a.75.75 0 0 0-1.344 0l-2.098 4.804-5.31.387a.75.75 0 0 0-.418 1.285l3.856 3.553-1.023 5.255a.75.75 0 0 0 1.088.816L10 15.763l4.844 2.535a.75.75 0 0 0 1.088-.816l-1.023-5.255 3.856-3.553a.75.75 0 0 0 .24-.538z"
                      />
                    </svg>
                  ))}
                  <span className="ml-2">rating</span>
                </div>
                <p className="mt-2 text-gray-600">{data.comment}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Account;
