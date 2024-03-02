// userUtils.js
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const fetchUserDetails = async (userId) => {
  try {
    const documentRef = doc(db, "users", userId);
    const docSnapshot = await getDoc(documentRef);
    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      return;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
};
