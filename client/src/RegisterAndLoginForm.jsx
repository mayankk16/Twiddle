// import {useContext, useState} from "react";
// import axios from "axios";
// import {UserContext} from "./User_Context.jsx";

// export default function RegisterAndLoginForm() {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
//   const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);
//   async function handleSubmit(ev) {
//     ev.preventDefault();
//     const url = isLoginOrRegister === 'register' ? '/register' : '/login';
//     const {data} = await axios.post(url, {username,password});
//     setLoggedInUsername(username);
//     setId(data.id);
//   }
//   return (
//     <div className="bg-blue-50 h-screen flex items-center">
//       <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
//         <input value={username}
//                onChange={ev => setUsername(ev.target.value)}
//                type="text" placeholder="username"
//                className="block w-full rounded-sm p-2 mb-2 border" />
//         <input value={password}
//                onChange={ev => setPassword(ev.target.value)}
//                type="password"
//                placeholder="password"
//                className="block w-full rounded-sm p-2 mb-2 border" />
//         <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
//           {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
//         </button>
//         <div className="text-center mt-2">
//           {isLoginOrRegister === 'register' && (
//             <div>
//               Already a member?
//               <button className="ml-1" onClick={() => setIsLoginOrRegister('login')}>
//                 Login here
//               </button>
//             </div>
//           )}
//           {isLoginOrRegister === 'login' && (
//             <div>
//               Dont have an account?
//               <button className="ml-1" onClick={() => setIsLoginOrRegister('register')}>
//                 Register
//               </button>
//             </div>
//           )}
//         </div>
//       </form>
//     </div>
//   );
// }

import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./User_Context.jsx";
import "./styles.css"; // Ensure your CSS file is imported
import Logo from "./logo.jsx";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginOrRegister, setIsLoginOrRegister] = useState('login');
  const [error, setError] = useState(null); // State for error message

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login';
    try {
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      console.error("Error during login/register:", error.response);
      setError(error.response.data); // Set error message received from server
    }
  }

  return (
    <div className="background-image full-screen">
      <Logo />
      <form className="form-container" onSubmit={handleSubmit}>
        {error && ( // Render error message if error state is set
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            value={username}
            onChange={(ev) => setUsername(ev.target.value)}
            type="text"
            placeholder="Enter your username"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Password
          </label>
          <input
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            type="password"
            placeholder="********"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
        </div>
        <div className="text-center mt-2 text-sm text-gray-600">
          {isLoginOrRegister === 'register' ? (
            <p>
              Already a member?{' '}
              <button
                className="text-blue-500 focus:outline-none"
                onClick={() => setIsLoginOrRegister('login')}
              >
                Login here
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{' '}
              <button
                className="text-blue-500 focus:outline-none"
                onClick={() => setIsLoginOrRegister('register')}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
