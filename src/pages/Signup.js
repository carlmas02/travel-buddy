import React, { useState } from "react";
import { auth, db, storage } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { fetchLoggedInUserDetails } from "../FirebaseUtility.js/userUtils";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [file, setFile] = useState(null); // State to store selected file

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(file);
    e.preventDefault();
    try {
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const date = new Date().getTime();
      const storageRef = ref(storage, `${name + date}`);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName: name,
              photoURL: downloadURL,
            });
            //create user on firestore

            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              name,
              email,
              age: parseInt(age),
              dateOfBirth: new Date(dob),
              gender,
              photoURL: downloadURL,
              avgRatings: 0,
              ratings: [],
            });

            await setDoc(doc(db, "companions", res.user.uid), {
              companions: [],
            });

            await setDoc(doc(db, "notifications", res.user.uid), {
              notifications: [],
            });
            // Navigate to the home page or any other route
            navigate("/home");
          } catch (err) {
            console.log(err);
          }
        });
      });
    } catch (err) {
      console.error(err);
      // Handle errors appropriately
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Sign Up</h2>
      <label>
        Name:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <br />
      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <br />
      <label>
        Age:
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(parseInt(e.target.value))}
        />
      </label>
      <br />
      <label>
        Date of Birth:
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </label>
      <br />
      <label>
        Gender:
        <select value={gender} onChange={(e) => setGender(e.target.value)}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </label>
      <br />
      {/* File input for selecting image */}
      <label>
        Profile Picture:
        <input
          type="file"
          onChange={(e) => {
            const selectedFile = e.target.files[0];
            console.log(selectedFile);
            setFile(selectedFile);
          }}
          required
        />
      </label>
      <br />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
