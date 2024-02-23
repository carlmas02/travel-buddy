import { useState, useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const useUserDetails = (id) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const documentRef = doc(db, "users", id);
        const docSnapshot = await getDoc(documentRef);
        if (docSnapshot.exists()) {
          // Set user details in state
          setUserDetails(docSnapshot.data());
        } else {
          setError("Document does not exist");
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if id is defined
    if (id) {
      fetchData();
    }

    // Clean-up function
    return () => {
      // If cleanup is needed, you can perform it here
    };
  }, [id]); // Dependency on id ensures that the effect re-runs when id changes

  // Return the state and any additional data or functions needed
  return { userDetails, loading, error };
};

export default useUserDetails;
