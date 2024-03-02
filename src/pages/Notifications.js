import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import React, { useState, useContext, useEffect } from "react";
import { db } from "../firebaseConfig";
import { v4 as uuid } from "uuid";
import { Link } from "react-router-dom";

const Notifications = () => {
  const { currentUser } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);

  const acceptRequest = async (senderId, notification) => {
    try {
      //add the sender to the logged in users's companion list
      await updateDoc(doc(db, "companions", currentUser.uid), {
        companions: arrayUnion(senderId),
      });

      //add the logged in user to the  req senders companion list
      await updateDoc(doc(db, "companions", senderId), {
        companions: arrayUnion(currentUser.uid),
      });

      //  this is to send the sender a notification that companion is added
      const senderDocumentRef = doc(db, "notifications", senderId);
      await updateDoc(senderDocumentRef, {
        notifications: arrayUnion({
          notificationId: uuid(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePhoto: currentUser.photoURL,
          receiverId: senderId,
          date: Timestamp.now(),
          status: "accepted-companion",
        }),
      });

      await clearNotification(notification);

      alert("companions list updated");
    } catch (err) {
      console.log(err);
    }
  };

  const clearNotification = async (notificationToRemove) => {
    try {
      // Get a reference to the document
      const documentRef = doc(db, "notifications", currentUser.uid);

      //  Update the document to remove elements from the array
      await updateDoc(documentRef, {
        notifications: arrayRemove(notificationToRemove),
      });

      console.log("Element removed successfully");
    } catch (error) {
      console.error("Error removing elements from array:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser.uid) {
          return; // Exit early if userId is undefined
        }
        const documentRef = doc(db, "notifications", currentUser.uid);
        const unsubscribe = onSnapshot(documentRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            // Set user details in state
            setNotifications(docSnapshot.data().notifications);
          } else {
            console.log("Document not present");
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [currentUser.uid]);
  return (
    <div className="overflow-x-auto">
      {notifications.length ? (
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>
                <label>
                  <input type="checkbox" className="checkbox" />
                </label>
              </th>
              <th>Name</th>
              <th>Description</th>
            </tr>
          </thead>

          <tbody>
            {notifications.map((notification) => {
              if (notification.status == "accepted-companion") {
                return (
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={notification.senderProfilePhoto} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {notification.senderName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{notification.senderName} accepted ur request</td>
                    <th>
                      <button
                        onClick={() => clearNotification(notification)}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear
                      </button>
                    </th>
                  </tr>
                );
              } else if (notification.status == "accepted-travel") {
                return (
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={notification.senderProfilePhoto} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {notification.senderName}{" "}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>You are travelling with {notification.senderName}</td>

                    <th>
                      <Link to={`/account/${notification.senderId}`}>
                        <button
                          onClick={() => clearNotification(notification)}
                          className="btn btn-ghost btn-xs"
                        >
                          Rate {notification.senderName}
                        </button>
                      </Link>
                      <button
                        onClick={() => clearNotification(notification)}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear
                      </button>
                    </th>
                  </tr>
                );
              } else if (notification.status == "chat-sent") {
                return (
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={notification.senderProfilePhoto} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {notification.senderName}{" "}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{notification.senderName} sent you a message </td>

                    <th>
                      <Link to={`/chat`}>
                        <button
                          onClick={() => clearNotification(notification)}
                          className="btn btn-ghost btn-xs"
                        >
                          Chat
                        </button>
                      </Link>
                      <button
                        onClick={() => clearNotification(notification)}
                        className="btn btn-ghost btn-xs"
                      >
                        Clear
                      </button>
                    </th>
                  </tr>
                );
              } else {
                return (
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <img src={notification.senderProfilePhoto} />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">
                            {notification.senderName}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {notification.senderName} sent you a companion request
                    </td>
                    <th>
                      <button
                        onClick={() =>
                          acceptRequest(notification.senderId, notification)
                        }
                        className="btn btn-ghost btn-xs hover:bg-green"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => clearNotification(notification)}
                        className="btn btn-ghost btn-xs"
                      >
                        Reject
                      </button>
                    </th>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      ) : (
        <div className=" container text-center p-6">
          <h1>No New Notifications</h1>
        </div>
      )}
    </div>
  );
};

export default Notifications;
