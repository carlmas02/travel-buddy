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
    <div>
      {notifications.map((notification) => {
        if (notification.status == "accepted-companion") {
          return (
            <div
              style={{ background: "green" }}
              key={notification.notificationId}
            >
              <div> {notification.senderId} </div>
              <div>
                <h1>{notification.senderName} accepted ur request</h1>
                <img
                  className="profilePic"
                  src={notification.senderProfilePhoto}
                />
              </div>

              <button onClick={() => clearNotification(notification)}>
                clear notification
              </button>
            </div>
          );
        } else if (notification.status == "accepted-travel") {
          return (
            <div
              style={{ background: "green" }}
              key={notification.notificationId}
            >
              <div> {notification.senderId} </div>
              <div>
                <h1>You are travelling with {notification.senderName}</h1>
                <h2>Feel free to rate {notification.senderName}</h2>

                <Link to={`/account/${notification.senderId}`}> Rate</Link>

                <img
                  className="profilePic"
                  src={notification.senderProfilePhoto}
                />
              </div>

              <button onClick={() => clearNotification(notification)}>
                clear notification
              </button>
            </div>
          );
        } else {
          return (
            <div
              style={{ background: "green" }}
              key={notification.notificationId}
            >
              <div> {notification.senderId} </div>
              <div>
                <h1>{notification.senderName}</h1>
                <img
                  className="profilePic"
                  src={notification.senderProfilePhoto}
                />
              </div>
              <button
                onClick={() =>
                  acceptRequest(notification.senderId, notification)
                }
              >
                Accept request
              </button>
              <button onClick={() => clearNotification(notification)}>
                del
              </button>
            </div>
          );
        }
      })}
    </div>
  );
};

export default Notifications;
