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
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null); // State to store selected file
  const [IDProof, setIDProof] = useState(null); // State to store selected file

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      // Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const date = new Date().getTime();
      const profilePicRef = ref(storage, `${name + date}-profilePic`);
      const idProofRef = ref(storage, `${name + date}-idProof`);

      // Upload profile picture
      await uploadBytesResumable(profilePicRef, file);

      // Upload ID proof image
      await uploadBytesResumable(idProofRef, IDProof);

      // Get download URLs
      const profilePicURL = await getDownloadURL(profilePicRef);
      const idProofURL = await getDownloadURL(idProofRef);

      // Update profile
      await updateProfile(res.user, {
        displayName: name,
        photoURL: profilePicURL,
      });

      // Create user on firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        name,
        email,
        age: parseInt(age),
        dateOfBirth: new Date(dob),
        gender,
        photoURL: profilePicURL,
        idProofURL, // Store ID proof URL
        avgRatings: 0,
        ratings: [],
        validIDProof: false,
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
      console.error("Error:", err);
      var modalCheckbox = document.getElementById("my_modal_6");
      modalCheckbox.checked = true;
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async (e) => {
  //   console.log(file);
  //   setLoading(true);
  //   e.preventDefault();
  //   try {
  //     // Create user
  //     const res = await createUserWithEmailAndPassword(auth, email, password);
  //     const date = new Date().getTime();
  //     const storageRef = ref(storage, `${name + date}-profilePic`);
  //     const idProofRef = ref(storage, `${name + date}-idProof`);

  //     await uploadBytesResumable(storageRef, file).then(() => {
  //       getDownloadURL(storageRef).then(async (downloadURL) => {
  //         try {
  //           //Update profile
  //           await updateProfile(res.user, {
  //             displayName: name,
  //             photoURL: downloadURL,
  //           });
  //           //create user on firestore

  //           await setDoc(doc(db, "users", res.user.uid), {
  //             uid: res.user.uid,
  //             name,
  //             email,
  //             age: parseInt(age),
  //             dateOfBirth: new Date(dob),
  //             gender,
  //             photoURL: downloadURL,
  //             avgRatings: 0,
  //             ratings: [],
  //           });

  //           await setDoc(doc(db, "companions", res.user.uid), {
  //             companions: [],
  //           });

  //           await setDoc(doc(db, "notifications", res.user.uid), {
  //             notifications: [],
  //           });
  //           // Navigate to the home page or any other route
  //           navigate("/home");
  //         } catch (err) {
  //           console.log(err);
  //         }
  //       });
  //     });
  //   } catch (err) {
  //     var modalCheckbox = document.getElementById("my_modal_6");
  //     modalCheckbox.checked = true;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div class="relative flex flex-col justify-center h-[90vh] overflow">
      <div class="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-lg">
        <h1 class="text-3xl font-semibold text-center text-purple-700">
          TravelBuddy
        </h1>

        <form onSubmit={handleSubmit} class="space-y-4 ">
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              class="w-full input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              class="w-full input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
              class="w-full input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            Age:
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              class="w-full input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            Date of Birth:
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              class="w-full input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            Gender:
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              class="w-full input input-bordered input-primary"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>
          <br />
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
              class="w-full pt-2 input input-bordered input-primary"
            />
          </label>
          <br />
          <label>
            ID Proof:
            <input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                console.log(selectedFile);
                setIDProof(selectedFile);
              }}
              required
              class="w-full pt-2 input input-bordered input-primary"
            />
          </label>
          <br />
          <button type="submit" class="btn btn-primary">
            {loading ? (
              <span className="loading loading-ring loading-lg"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>
      </div>

      <input type="checkbox" id="my_modal_6" class="modal-toggle" />
      <div class="modal" role="dialog">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Signup Failed</h3>
          <p class="py-4">Please make sure </p>
          <div class="modal-action">
            <label for="my_modal_6" class="btn">
              Close!
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
