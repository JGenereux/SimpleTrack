import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import STLOGO from "../../public/images/STLOGO.png";
import { useAuth } from "./Provider/authProvider";

export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <LoginForm />
    </div>
  );
}

type Account = {
  email: string;
  password: string;
};
function LoginForm() {
  const [account, setAccount] = useState<Account>({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const auth = useAuth();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (account.email == "" || account.password == "") {
      window.alert("Email or password were not entered");
    }
    try {
      const response = await axios.post(
        "https://simple-track-server.vercel.app/login",
        account
      );
      //api sends a jwt to store locally (for now).
      const JWT_TOKEN = response.data;
      //200 status means user entered valid credentials
      if (response.status == 200) {
        navigate("/");
        auth.setToken(JWT_TOKEN);
        auth.setUserEmail(account.email);
      }
    } catch (error) {
      console.log(error);
      window.alert("This user doesn't exist or entered the wrong credentials");
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-[60%] min-h-fit md:h-[60%] bg-slate-50 shadow-2xl items-center">
      <div className="flex flex-col w-[50%] min-h-fit md:h-full justify-center items-center">
        <img
          src={STLOGO}
          alt="SimpleTrack Logo"
          className="h-[75px] md:h-[75px] lg:h-[90px]"
        ></img>
        <p className="md:mb-0 font-headerFont text-3xl">SimpleTrack</p>
      </div>
      <div className="flex flex-col w-[50%] h-full mr-5 justify-center">
        <form className="flex flex-col" onSubmit={(e) => handleLogin(e)}>
          <div className="flex flex-col">
            <p className="ml-[17%] font-textFont md:text-lg">Email</p>
            <input
              type="text"
              value={account.email}
              onChange={(e) =>
                setAccount({
                  email: e.target.value,
                  password: account.password,
                })
              }
              className="border-black border-2 rounded-lg h-8 w-2/3 mx-auto pl-2"
            ></input>
          </div>
          <div className="flex flex-col my-5">
            <p className="ml-[17%] font-textFont md:text-lg">Password</p>
            <input
              type="password"
              autoComplete="on"
              value={account.password}
              onChange={(e) =>
                setAccount({ email: account.email, password: e.target.value })
              }
              className="border-black border-2 rounded-lg h-8 w-2/3 mx-auto pl-2"
            ></input>
          </div>
          <button
            type="submit"
            className="mx-auto font-textFont text-base md:text-lg w-[35%] md:h-12 rounded-lg border-black border-2 mb-12 md:mb-0"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
