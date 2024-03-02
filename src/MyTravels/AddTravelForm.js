import React, { useState, useEffect } from "react";
import { realtimeDB } from "../firebaseConfig";
import { ref, set, push, onValue, off } from "firebase/database";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { fetchUserDetails } from "../FirebaseUtility.js/userUtils";

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

    const userDetails = await fetchUserDetails(currentUser.uid);
    console.log(userDetails);
    await push(ref(realtimeDB, "current-travelers/" + currentUser.uid), {
      destination,
      date: date,
      leavingTime: leavingTime,
      userId: currentUser.uid,
      name: userDetails.name,
      gender: userDetails.gender,
      profilePhoto: userDetails.photoURL,
    });

    var modalCheckbox = document.getElementById("my_modal_5");
    modalCheckbox.showModal();
  };

  return (
    <div>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Destination Added</h3>
          <p className="py-4">We have added your travel plan !</p>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="flex flex-col items-center justify-center bg-slate-400 h-[45vh] md:h-[30vh]">
        <form
          onSubmit={handleSubmit}
          className=" w-[95%] md:w-[70%] flex flex-col md:flex-row items-center justify-between bg-white p-5 md:p-8 rounded-3xl"
        >
          <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
            <label htmlFor="destination" className="mb-2">
              Destination:
            </label>
            <input
              type="text"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
              className="input input-bordered max-w-xs border-r-0 md:border-r-2 border-gray-300"
            />
          </div>
          <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
            <label htmlFor="date" className="mb-2">
              Date:
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="border-r-0 md:border-r-2 border-gray-300"
            />
          </div>
          <div className="flex flex-col w-full md:w-auto mb-4 md:mb-0">
            <label htmlFor="time" className="mb-2">
              Time:
            </label>
            <input
              type="time"
              id="time"
              value={leavingTime}
              onChange={(e) => setLeavingTime(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary w-full md:w-auto" type="submit">
            Add Trip
          </button>
        </form>
      </div>

      <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
        <li>
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="timeline-start md:text-end mb-5">
            <time className="font-mono italic">Step 1</time>
            <div className="text-xl font-black">Add a Travel Destination</div>
            Fill the above simple form to add a destination to let other users
            know.
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="timeline-end mb-5">
            <time className="font-mono italic">Step 2</time>
            <div className="text-lg font-black">
              Users send you companion request
            </div>
            We believe in safety. A user can only travel with you if they have
            connected with you. You will get a companion request which you could
            decide to accept or reject
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="timeline-start md:text-end mb-10">
            <time className="font-mono italic">Step 3</time>
            <div className="text-lg font-black">Connect with the user</div>
            Contact the user with in-built chat feature and finalise the travel
            plan
          </div>
          <hr />
        </li>
        <li>
          <hr />
          <div className="timeline-middle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="timeline-end mb-10">
            <time className="font-mono italic">Step 4</time>
            <div className="text-lg font-black">Confirm the travel</div>
            Confirm your travel in a single click !
          </div>
          <hr />
        </li>
      </ul>
    </div>
  );
}

export default AddTravelForm;

const Modal = () => {};
