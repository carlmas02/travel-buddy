import React, { useEffect, useContext, useState } from "react";
import { fetchUserDetails } from "../FirebaseUtility.js/userUtils";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthSpace = () => {
  const { currentUser } = useContext(AuthContext);
  const [data, setData] = useState();

  const navigate = useNavigate();

  const getData = async () => {
    if (currentUser) {
      try {
        const data = await fetchUserDetails(currentUser.uid);
        console.log(data);
        if (data.validIDProof) {
          alert("Your ID Proof is verified !");
          navigate("/home");
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    getData();
  }, [currentUser]);

  return (
    <section class="flex flex-col justify-center antialiased bg-gray-50 text-gray-600 min-h-screen p-4">
      <div class="h-full">
        <div class="max-w-2xl mx-auto bg-indigo-600 shadow-lg rounded-lg">
          <div class="px-6 py-5">
            <div class="flex items-start">
              <svg
                class="fill-current flex-shrink-0 mr-5"
                width="30"
                height="30"
                viewBox="0 0 30 30"
              >
                <path
                  class="text-indigo-300"
                  d="m16 14.883 14-7L14.447.106a1 1 0 0 0-.895 0L0 6.883l16 8Z"
                />
                <path
                  class="text-indigo-200"
                  d="M16 14.619v15l13.447-6.724A.998.998 0 0 0 30 22V7.619l-14 7Z"
                />
                <path
                  class="text-indigo-500"
                  d="m16 14.619-16-8V21c0 .379.214.725.553.895L16 29.619v-15Z"
                />
              </svg>
              <div class="flex-grow truncate">
                <div class="w-full sm:flex justify-between items-center mb-3">
                  <h2 class="text-2xl leading-snug font-extrabold text-gray-50 truncate mb-1 sm:mb-0">
                    ID Proof is not yet verified
                  </h2>
                </div>
                <div class="flex items-end justify-between whitespace-normal">
                  <div class="max-w-md text-indigo-100">
                    <p class="mb-2">
                      Please click on the retry button to try again, as ID Proof
                      is verified you will be taken to the next page
                    </p>
                  </div>
                  <button
                    class="flex-shrink-0 flex items-center justify-center text-indigo-600 w-10 h-10 rounded-full bg-gradient-to-b from-indigo-50 to-indigo-100 hover:from-white hover:to-indigo-50 focus:outline-none focus-visible:from-white focus-visible:to-white transition duration-150 ml-2"
                    onClick={getData}
                  >
                    🔃
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthSpace;
