import React from "react";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      var modalCheckbox = document.getElementById("my_modal_6");
      // Set the checkbox to checked to open the modal
      modalCheckbox.checked = true;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="relative flex flex-col justify-center h-[90vh] overflow-hidden">
      <div class="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-lg">
        <h1 class="text-3xl font-semibold text-center text-purple-700">
          TravelBuddy
        </h1>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div>
            <label class="label">
              <span class="text-base label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email Address"
              class="w-full input input-bordered input-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label class="label">
              <span class="text-base label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              class="w-full input input-bordered input-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <a
            href={"/signup"}
            class="text-xs text-gray-600 hover:underline hover:text-blue-600"
          >
            New User? Sign Up
          </a>
          <div>
            <button type="submit" class="btn btn-primary">
              {loading ? (
                <span className="loading loading-ring loading-lg"></span>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>
      </div>

      <input type="checkbox" id="my_modal_6" class="modal-toggle" />
      <div class="modal" role="dialog">
        <div class="modal-box">
          <h3 class="font-bold text-lg">Login Failed</h3>
          <p class="py-4">Please check your email or password</p>
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

export default Login;
