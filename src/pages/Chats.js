import React, { useState, useEffect, useRef } from "react";
import {
  onSnapshot,
  arrayUnion,
  doc,
  serverTimestamp,
  getDoc,
  Timestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { realtimeDB, db } from "../firebaseConfig";
import { ref, remove, get } from "firebase/database";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";

const ChatLayout = ({ messages, chatId, receiverId }) => {
  const [text, setText] = useState("");
  const { currentUser } = useContext(AuthContext);

  const motionRef = useRef();

  useEffect(() => {
    motionRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e, typeOfMessage) => {
    e.preventDefault();
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
      const senderDocumentRef = doc(db, "notifications", receiverId);
      await updateDoc(senderDocumentRef, {
        notifications: arrayUnion({
          notificationId: uuid(),
          senderId: currentUser.uid,
          senderName: currentUser.displayName,
          senderProfilePhoto: currentUser.photoURL,
          receiverId: receiverId,
          date: Timestamp.now(),
          status: "chat-sent",
        }),
      });
      //  sending chats
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

  const ignoreRequest = async () => {
    const newMessages = [];
    for (const message of messages) {
      if (message.travelRequest === false) {
        // console.log("Message found:", message);
        newMessages.push(message);
      }
    }

    await updateDoc(doc(db, "chats", chatId), {
      messages: newMessages,
    });
    console.log(newMessages);
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages ? (
          messages.map((message, index) => {
            if (message.travelRequest) {
              console.log(message, chatId);
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
                            className="btn ml-4 btn-success"
                            onClick={() =>
                              travelWithCompanion(message, message.senderId)
                            }
                          >
                            Accept{" "}
                          </button>
                          <button
                            onClick={ignoreRequest}
                            className="btn ml-4 btn-error"
                          >
                            Ignore{" "}
                          </button>
                        </b>
                      )}
                    </span>
                  </p>
                </div>
              );
            } else {
              return (
                <div
                  className={`chat ${
                    message.senderId === currentUser.uid
                      ? "chat-end "
                      : "chat-start"
                  }  `}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img alt="" src={message.senderProfilePhoto} />
                    </div>
                  </div>
                  {message.senderId === currentUser.uid ? (
                    <div class="chat-header">
                      You
                      <time class="text-xs opacity-50"></time>
                    </div>
                  ) : (
                    <div class="chat-header">{message.senderName}</div>
                  )}
                  <div className="chat-bubble">{message.text}</div>
                </div>
              );
            }
          })
        ) : (
          <p>Loading...</p>
        )}

        <div ref={motionRef}></div>
      </div>
      <div className="chat-input">
        <form>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered max-w-xs"
            onChange={(e) => setText(e.target.value)}
          />
          <button
            onClick={(e) => sendMessage(e, "")}
            className="btn btn-secondary"
          >
            Send Message
          </button>
        </form>
        <button
          onClick={(e) => sendMessage(e, "TRAVEL_REQUEST")}
          class="ml-2 btn btn-outline btn-primary"
        >
          Confirm Travel
        </button>
      </div>
    </div>
  );
};

const Chats = ({ chatId, name, receiverId }) => {
  const [messages, setMessages] = useState();

  useEffect(() => {
    // const user
    const unSub = onSnapshot(doc(db, "chats", chatId), (doc) => {
      doc.exists() && setMessages(doc.data().messages);
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  return (
    <div>
      <div className=" h-[3.8rem] bg-gray-400 flex items-center pl-8 text-xl font-bold">
        Chatting with {name}
      </div>

      <ChatLayout messages={messages} chatId={chatId} receiverId={receiverId} />
    </div>
  );
};

export default Chats;
