import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { db } from "../firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import Chats from "./Chats";
import { fetchUserDetails } from "../FirebaseUtility.js/userUtils";

const ChatHome = () => {
  const { currentUser } = useContext(AuthContext);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatId, setChatId] = useState();
  const [userId, setUserId] = useState();
  const [chatName, setChatName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!currentUser.uid) {
          return; // Exit early if userId is undefined
        }
        const documentRef = doc(db, "userChats", currentUser.uid);
        const docSnap = await getDoc(documentRef);
        if (docSnap.exists()) {
          const history = [];
          for (const id of docSnap.data().history) {
            const userInfo = await fetchUserDetails(id.userId);
            userInfo.chatId = id.chatId;

            history.push(userInfo);
          }

          setChatHistory(history);
        } else {
          // docSnap.data() will be undefined in this case
          console.log("No such document!");
        }

        return () => unsubscribe();
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [currentUser.uid]);

  return (
    <div className="flex h-[90vh]">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-200">
        <h2 className="text-lg font-semibold bg-gray-300 p-4">Chats</h2>
        <ul>
          {chatHistory.map((chat) => {
            console.log(chat.uid);
            return (
              <li
                onClick={() => {
                  setChatId(chat.chatId);
                  setChatName(chat.name);
                  setUserId(chat.uid);
                }}
                key={chat.uid}
                className=" flex gap-1 items-center  p-4 hover:bg-gray-300 cursor-pointer"
              >
                <div class="w-12">
                  <img className=" rounded-xl " src={chat.photoURL} />
                </div>
                {chat.name}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Main bar */}
      <div className="w-3/4 bg-gray-100">
        {chatId && (
          <Chats chatId={chatId} name={chatName} receiverId={userId} />
        )}
      </div>
    </div>
  );
};

export default ChatHome;
