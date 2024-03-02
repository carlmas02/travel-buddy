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
  const [weather, setWeather] = useState({});
  const navigate = useNavigate();

  const getWeatherInfo = () => {
    // Get user's current location using Geolocation API
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Make a request to the weather API with user's coordinates
        const apiKey = "8f42afa7a4084915b7e70303231105";
        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${latitude},${longitude}`;

        fetch(apiUrl)
          .then((response) => response.json())
          .then((data) => {
            // Handle the weather data here, for example:
            const weather = {
              location: data.location.name + "," + data.location.country,
              temperature: data.current.feelslike_c,
              icon: data.current.condition.icon,
            };
            setWeather(weather);
            console.log(weather);
          })
          .catch((error) => {
            console.error("Error fetching weather data:", error);
          });
      },
      function (error) {
        console.error("Error getting user location:", error.message);
      }
    );
  };

  useEffect(() => {
    getWeatherInfo();
  }, []);

  const handleSubmit = () => {
    // Here you would handle form submission (e.g., pass form data to a parent component)
    console.log("Destination:", destination);
    console.log("Date:", date);
    console.log("Time:", time);

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
  };

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
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
        //create user chats
        // to create chat history for logeed in user
        const currentUserRes = await getDoc(
          doc(db, "userChats", currentUser.uid)
        );
        console.log(currentUserRes.exists());
        if (currentUserRes.exists()) {
          // console;
          await updateDoc(doc(db, "userChats", currentUser.uid), {
            history: arrayUnion({
              userId: userId,
              chatId: combinedId,
            }),
          });
        } else {
          alert("ok");
          await setDoc(doc(db, "userChats", currentUser.uid), {
            history: [],
          });

          await updateDoc(doc(db, "userChats", currentUser.uid), {
            history: arrayUnion({
              userId: userId,
              chatId: combinedId,
            }),
          });
        }
        // to create chat history for other user
        const res2 = await getDoc(doc(db, "userChats", userId));
        if (res2.exists()) {
          await updateDoc(doc(db, "userChats", userId), {
            history: arrayUnion({
              userId: currentUser.uid,
              chatId: combinedId,
            }),
          });
        } else {
          await setDoc(doc(db, "userChats", userId), {
            history: [],
          });

          await updateDoc(doc(db, "userChats", userId), {
            history: arrayUnion({
              userId: currentUser.uid,
              chatId: combinedId,
            }),
          });
        }

        console.log("made");
      }
      navigate(`/chat`);
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

  // useEffect(() => {
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
  //         // Update the travelers state here
  //         console.log(trips);
  //         setTravelers(trips);
  //       }
  //     })
  //     .catch((error) => {
  //       // Handle any errors
  //       console.error("Error getting data:", error);
  //     });
  // }, [destination, date, currentUser.uid]);
  return (
    // <div className="">
    //   <div className="flex flex-col items-center justify-center bg-slate-400 h-[45vh] md:h-[30vh]">
    //     <div className=" w-[95%] md:w-[70%] flex flex-col md:flex-row items-center justify-between bg-white p-5 md:p-8 rounded-3xl">
    //       <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
    //         <label htmlFor="destination" className="mb-2">
    //           Destination:
    //         </label>
    //         <input
    //           type="text"
    //           id="destination"
    //           value={destination}
    //           onChange={(e) => setDestination(e.target.value)}
    //           required
    //           className="input input-bordered max-w-xs border-r-0 md:border-r-2 border-gray-300"
    //         />
    //       </div>
    //       <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
    //         <label htmlFor="date" className="mb-2">
    //           Date:
    //         </label>
    //         <input
    //           type="date"
    //           id="date"
    //           value={date}
    //           onChange={(e) => setDate(e.target.value)}
    //           required
    //           className="border-r-0 md:border-r-2 border-gray-300"
    //         />
    //       </div>
    //       <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
    //         <label htmlFor="time" className="mb-2">
    //           Time:
    //         </label>
    //         <input
    //           type="time"
    //           id="time"
    //           value={time}
    //           onChange={(e) => setTime(e.target.value)}
    //           required
    //         />
    //       </div>
    //       <button
    //         onClick={handleSubmit}
    //         className="btn btn-primary w-full md:w-auto"
    //         // type="submit"
    //       >
    //         Search
    //       </button>
    //     </div>
    //   </div>

    // {travelers.length == 0 ? (
    //   <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
    //     <li>
    //       <div className="timeline-middle">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 20 20"
    //           fill="currentColor"
    //           className="h-5 w-5"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </div>
    //       <div className="timeline-start md:text-end mb-5">
    //         <time className="font-mono italic">Step 1</time>
    //         <div className="text-xl font-black">Search for a Destination</div>
    //         Fill the above simple form to search for a traveler
    //       </div>
    //       <hr />
    //     </li>
    //     <li>
    //       <hr />
    //       <div className="timeline-middle">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 20 20"
    //           fill="currentColor"
    //           className="h-5 w-5"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </div>
    //       <div className="timeline-end mb-5">
    //         <time className="font-mono italic">Step 2</time>
    //         <div className="text-lg font-black">Connect with the user</div>
    //         You can connect and create a companion and contact with in-built
    //         chat system
    //       </div>
    //       <hr />
    //     </li>
    //     <li>
    //       <hr />
    //       <div className="timeline-middle">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 20 20"
    //           fill="currentColor"
    //           className="h-5 w-5"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </div>
    //       <div className="timeline-start md:text-end mb-10">
    //         <time className="font-mono italic">Step 3</time>
    //         <div className="text-lg font-black">Send Travel Request</div>
    //         Contact the user with in-built chat feature and finalise the
    //         travel plan
    //       </div>
    //       <hr />
    //     </li>
    //     <li>
    //       <hr />
    //       <div className="timeline-middle">
    //         <svg
    //           xmlns="http://www.w3.org/2000/svg"
    //           viewBox="0 0 20 20"
    //           fill="currentColor"
    //           className="h-5 w-5"
    //         >
    //           <path
    //             fillRule="evenodd"
    //             d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
    //             clipRule="evenodd"
    //           />
    //         </svg>
    //       </div>
    //       <div className="timeline-end mb-10">
    //         <time className="font-mono italic">Step 4</time>
    //         <div className="text-lg font-black">Confirm the travel</div>
    //         Confirm your travel in a single click !
    //       </div>
    //       <hr />
    //     </li>
    //   </ul>
    // ) : (
    //   Object.keys(travelers).map((userId) => {
    //     // returnUserDetails(userId);

    //     return (
    //       <div className="m-auto flex flex-col items-center my-4 ">
    //         {travelers.map((trip, index) => (
    //           <div className="stats shadow w-2/3">
    //             <div className="stat">
    //               <div className="stat-figure text-primary">
    //                 <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   className="inline-block w-8 h-8 stroke-current"
    //                 >
    //                   <circle cx="12" cy="12" r="10"></circle>
    //                   <path d="M12 6v6l3 3"></path>
    //                 </svg>
    //               </div>
    //               <div className="stat-title">Leaving Time</div>
    //               <div className="stat-value text-primary">
    //                 {trip.leavingTime}
    //               </div>
    //               <div className="stat-desc">{trip.date}</div>
    //             </div>

    //             <div className="stat ">
    //               <div className="stat-figure text-secondary">
    //                 <svg
    //                   xmlns="http://www.w3.org/2000/svg"
    //                   fill="none"
    //                   viewBox="0 0 24 24"
    //                   className="inline-block w-8 h-8 stroke-current"
    //                 >
    //                   <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path>
    //                   <circle cx="12" cy="10" r="3"></circle>
    //                 </svg>
    //               </div>
    //               <div className="stat-title">Destination</div>
    //               <div className="stat-value text-secondary">
    //                 {trip.destination}
    //               </div>
    //               <div className="stat-desc"></div>
    //             </div>

    //             <div className="stat">
    //               <div className="stat-figure text-secondary">
    //                 <div className="avatar online">
    //                   <div className="w-16 rounded-full">
    //                     <img src={trip.profilePhoto} />
    //                   </div>
    //                 </div>
    //               </div>
    //               <div className="stat-value">{trip.name} </div>
    //               {trip.companion === true ? (
    //                 <button
    //                   className="btn btn-xs"
    //                   onClick={() => chatWithUser(trip.userId)}
    //                 >
    //                   Chat with {trip.name}
    //                 </button>
    //               ) : (
    //                 <button
    //                   className="btn btn-xs"
    //                   onClick={() => sendCompanionRequest(trip.userId)}
    //                 >
    //                   Connect with {trip.name}
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //         ))}
    //       </div>
    //     );
    //   })
    // )}
    // </div>
    <div className="bg-gradient-to-b from-blue-400 via-gray-200 to-white min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="bg-gradient-to-b from-blue-400 via-gray-200 to-white  py-8">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-8">
            <div className="max-w-md bg-white rounded-xl shadow-xl p-6">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:m-auto">
                  <img
                    class="w-10  m-auto object-cover md:w-10"
                    src={weather?.icon}
                    alt="Weather condition image"
                  />
                </div>
                <div className="p-8">
                  <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                    Location
                  </div>
                  <p class="mt-2 text-gray-900">{weather?.location}</p>

                  <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold mt-4">
                    Temperature
                  </div>
                  <p class="mt-2 text-gray-900">{weather?.temperature}°C</p>
                </div>
              </div>
            </div>

            <div className="max-w-3xl bg-white rounded-xl shadow-xl p-8">
              <h1 className="text-3xl font-bold text-gray-800">
                Find Your Travel Companion
              </h1>
              <div className="flex flex-col md:flex-row items-center gap-2 justify-between space-y-4 md:space-y-0">
                <div className="w-full md:w-1/3">
                  <label htmlFor="destination" className="text-gray-700 mb-2">
                    Destination:
                  </label>
                  <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="input input-bordered w-full max-w-md"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label htmlFor="date" className="text-gray-700 mb-2">
                    Date:
                  </label>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="input input-bordered w-full max-w-md"
                  />
                </div>
                <div className="w-full md:w-1/3">
                  <label htmlFor="time" className="text-gray-700 mb-2">
                    Time:
                  </label>
                  <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    className="input input-bordered w-full max-w-md"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                className="btn btn-primary w-full md:w-auto mt-4"
              >
                Search
              </button>
            </div>
          </div>
        </div>

        {travelers.length == 0 ? (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:scale-105 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-blue-500 mb-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M13.67 2.33a.75.75 0 00-1.06 0l-6 6a.75.75 0 001.06 1.06L12 6.06V15a1 1 0 001 1h1a1 1 0 001-1V6.06l4.97 4.97a.75.75 0 001.06-1.06l-6-6z"
                  clip-rule="evenodd"
                />
              </svg>
              <h2 class="text-xl font-semibold mb-2">Shared Experiences</h2>
              <p class="text-gray-700 text-center">
                Share memorable experiences with someone special.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:scale-105 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-blue-500 mb-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clip-rule="evenodd"
                />
              </svg>
              <h2 onClick={getWeatherInfo} class="text-xl font-semibold mb-2">
                Cost Savings
              </h2>
              <p class="text-gray-700 text-center">
                Save money by splitting costs like accommodations and
                transportation.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:scale-105 transition-all">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-12 w-12 text-blue-500 mb-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clip-rule="evenodd"
                />
              </svg>
              <h2 class="text-xl font-semibold mb-2">
                Shared Responsibilities
              </h2>
              <p class="text-gray-700 text-center">
                Divide tasks and responsibilities to make the trip smoother.
              </p>
            </div>
          </div>
        ) : (
          Object.keys(travelers).map((userId) => {
            // returnUserDetails(userId);

            return (
              <div className="m-auto flex flex-col items-center my-4 ">
                {travelers.map((trip, index) => (
                  <div className="stats shadow w-2/3">
                    <div className="stat">
                      <div className="stat-figure text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="inline-block w-8 h-8 stroke-current"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 6v6l3 3"></path>
                        </svg>
                      </div>
                      <div className="stat-title">Leaving Time</div>
                      <div className="stat-value text-primary">
                        {trip.leavingTime}
                      </div>
                      <div className="stat-desc">{trip.date}</div>
                    </div>

                    <div className="stat ">
                      <div className="stat-figure text-secondary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          className="inline-block w-8 h-8 stroke-current"
                        >
                          <path d="M21 10c0 6-9 13-9 13s-9-7-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </div>
                      <div className="stat-title">Destination</div>
                      <div className="stat-value text-secondary">
                        {trip.destination}
                      </div>
                      <div className="stat-desc"></div>
                    </div>

                    <div className="stat">
                      <div className="stat-figure text-secondary">
                        <div className="avatar online">
                          <div className="w-16 rounded-full">
                            <img src={trip.profilePhoto} />
                          </div>
                        </div>
                      </div>
                      <div className="stat-value">{trip.name} </div>
                      {trip.companion === true ? (
                        <button
                          className="btn btn-xs"
                          onClick={() => chatWithUser(trip.userId)}
                        >
                          Chat with {trip.name}
                        </button>
                      ) : (
                        <button
                          className="btn btn-xs"
                          onClick={() => sendCompanionRequest(trip.userId)}
                        >
                          Connect with {trip.name}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })
        )}
        {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-blue-500 mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M13.67 2.33a.75.75 0 00-1.06 0l-6 6a.75.75 0 001.06 1.06L12 6.06V15a1 1 0 001 1h1a1 1 0 001-1V6.06l4.97 4.97a.75.75 0 001.06-1.06l-6-6z"
                clip-rule="evenodd"
              />
            </svg>
            <h2 class="text-xl font-semibold mb-2">Shared Experiences</h2>
            <p class="text-gray-700 text-center">
              Share memorable experiences with someone special.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-blue-500 mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
            <h2 onClick={test} class="text-xl font-semibold mb-2">
              Cost Savings
            </h2>
            <p class="text-gray-700 text-center">
              Save money by splitting costs like accommodations and
              transportation.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-12 w-12 text-blue-500 mb-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clip-rule="evenodd"
              />
            </svg>
            <h2 class="text-xl font-semibold mb-2">Shared Responsibilities</h2>
            <p class="text-gray-700 text-center">
              Divide tasks and responsibilities to make the trip smoother.
            </p>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default SearchTraveller;

{
  /* <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div class="md:flex">
          <div class="md:flex-shrink-0">
            <img
              class="h-48 w-full object-cover md:w-48"
              src="image-url"
              alt="Weather condition image"
            />
          </div>
          <div class="p-8">
            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Location
            </div>
            <p class="mt-2 text-gray-900">New York, USA</p>

            <div class="uppercase tracking-wide text-sm text-indigo-500 font-semibold mt-4">
              Temperature
            </div>
            <p class="mt-2 text-gray-900">25°C</p>
          </div>
        </div>
      </div> */
}
