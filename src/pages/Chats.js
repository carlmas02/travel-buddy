import React, { useState, useEffect } from "react";
import {
  onSnapshot,
  arrayUnion,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { realtimeDB, db } from "../firebaseConfig";
import { ref, remove } from "firebase/database";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";

const ChatLayout = ({ messages }) => {
  const [text, setText] = useState("");
  const { currentUser } = useContext(AuthContext);

  const { chatId } = useParams();

  const sendMessage = async (e, typeOfMessage) => {
    e.preventDefault();
    console.log(currentUser);
    if (typeOfMessage === "TRAVEL_REQUEST") {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          id: uuid(),
          text: "",
          travelRequest: true,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePhoto: currentUser.photoURL,
          date: Timestamp.now(),
        }),
      });
    } else {
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePhoto: currentUser.photoURL,
          date: Timestamp.now(),
          travelRequest: false,
        }),
      });
    }
  };

  const travelWithCompanion = async (senderMessageData, senderId) => {
    // this notification is to send the companion
    const senderDocumentRef = doc(db, "notifications", senderId);
    await updateDoc(senderDocumentRef, {
      notifications: arrayUnion({
        notificationId: uuid(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        senderProfilePhoto: currentUser.photoURL,
        receiverId: senderId,
        date: Timestamp.now(),
        status: "accepted-travel",
      }),
    });

    const sendersTravels = ref(realtimeDB, "current-travelers/" + senderId);
    await remove(sendersTravels);

    // this is to send notif to urself
    const recieverDocumentRef = doc(db, "notifications", currentUser.uid);
    await updateDoc(recieverDocumentRef, {
      notifications: arrayUnion({
        notificationId: uuid(),
        senderId: senderId,
        senderName: senderMessageData.senderName,
        senderProfilePhoto: senderMessageData.senderProfilePhoto,
        receiverId: currentUser.uid,
        date: Timestamp.now(),
        status: "accepted-travel",
      }),
    });

    const currentUsersTravels = ref(
      realtimeDB,
      "current-travelers/" + currentUser.uid
    );
    await remove(currentUsersTravels);

    alert("request accepted");
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages ? (
          messages.map((message, index) => {
            if (message.travelRequest) {
              return (
                <div
                  key={index}
                  className={`message ${
                    message.senderId === currentUser.uid ? "user" : "other"
                  }`}
                >
                  <p>
                    <span>
                      {message.senderId === currentUser.uid ? (
                        <b>You have sent a travel request !</b>
                      ) : (
                        <b>
                          {message.senderName} has sent you a travel request !
                          <button
                            onClick={() =>
                              travelWithCompanion(message, message.senderId)
                            }
                          >
                            Accept{" "}
                          </button>
                          <button>Ignore </button>
                        </b>
                      )}
                    </span>
                  </p>
                </div>
              );
            } else {
              return (
                <div
                  key={index}
                  className={`message ${
                    message.senderId === currentUser.uid ? "user" : "other"
                  }`}
                >
                  <p>
                    <span>
                      {message.senderId === currentUser.uid ? (
                        <b>You :</b>
                      ) : (
                        <b>{message.senderName} :</b>
                      )}
                    </span>{" "}
                    {message.text}
                  </p>
                </div>
              );
            }
          })
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="chat-input">
        <form>
          <input
            type="text"
            placeholder="Type your message..."
            onChange={(e) => setText(e.target.value)}
            required
          />
          <button onClick={(e) => sendMessage(e, "")}>Send</button>
        </form>
      </div>
      <button onClick={(e) => sendMessage(e, "TRAVEL_REQUEST")}>
        Confirm travel
      </button>
    </div>
  );
};

const Chats = () => {
  const [messages, setMessages] = useState();

  const { chatId } = useParams();

  const test = () => {
    const databaseRef = ref(
      realtimeDB,
      "current-travelers/O5gmpcnk61SAk4jLZsShgMiNXsj2"
    );
    remove(databaseRef)
      .then(() => {
        console.log("All entries deleted successfully.");
      })
      .catch((error) => {
        console.error("Error deleting entries:", error);
      });
  };

  useEffect(() => {
    // const user
    const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, []);

  return (
    <div>
      <div>List of chats</div>

      <ChatLayout messages={messages} />

      <button onClick={test}>test</button>
    </div>
  );
};

export default Chats;
