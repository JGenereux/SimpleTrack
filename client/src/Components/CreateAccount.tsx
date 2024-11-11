import Navbar from "../Utils/Navbar";
import { FormEvent, useState } from "react";
import axios from "axios";
import STLOGO from "../images/STLogo.png";
import ValidateEmail from "../Utils/Functions/emailValidate";
import ValidatePswd from "../Utils/Functions/pswdValidate";

export default function CreateAccount() {
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div className="flex min-h-screen w-full p-4">
        <MainForm />
      </div>
    </div>
  );
}

function MainForm() {
  return (
    <div className="flex flex-col lg:flex-row h-4/5 w-2/4 mx-auto my-10 border-black border-4 overflow-hidden">
      <Display />
      <SignUp />
    </div>
  );
}

function Display() {
  return (
    <div className="flex flex-col w-full lg:w-1/2 justify-center items-center">
      <div className="flex flex-col">
        <img src={STLOGO} alt="icon" className="mx-[25%] w-[100px]"></img>
        <h1 className="font-headerFont text-xl sm:text-2xl lg:text-3xl text-center">
          SimpleTrack
        </h1>
      </div>
    </div>
  );
}

interface UserInfo {
  username: string;
  email: string;
  weight: string;
  height: string;
  password: string;
}
//make password show conditionally based on if user is using google oauth to signup or not.
function SignUp() {
  const [User, setUser] = useState<UserInfo>({
    username: "",
    email: "",
    weight: "",
    height: "",
    password: "",
  });

  const handleUpdate = (field: keyof UserInfo, value: string): void => {
    setUser((prevUser) => ({
      ...prevUser,
      [field]: value,
    }));
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ValidateEmail(User.email)) {
      window.alert("Invalid email entered. Must contain a @ followed by a .");
      return;
    }
    if (!ValidatePswd(User.password)) {
      window.alert(
        "Invalid password entered. Must contain 8 letters, a digit, and a special character."
      );
      return;
    }

    try {
      const res = await axios.post(
        "https://simple-track-server-jgenereuxs-projects.vercel.app/accounts/createAccount",
        User
      );
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="flex flex-col w-full lg:w-1/2 justify-center items-center">
      <h1 className="font-headerFont text-3xl sm:text-4xl mb-2">Welcome!</h1>
      <h3 className="font-buttonFont text-xl sm:text-xl mb-4">
        Please signup below
      </h3>
      <form onSubmit={(e) => handleSubmit(e)}>
        <FormTextInput
          value="username"
          quality={User.username}
          setQuality={handleUpdate}
        />
        <FormTextInput
          value="email"
          quality={User.email}
          setQuality={handleUpdate}
        />
        <FormTextInput
          value="password"
          quality={User.password}
          setQuality={handleUpdate}
        />
        <FormTextInput
          value="weight"
          quality={User.weight}
          setQuality={handleUpdate}
        />
        <FormTextInput
          value="height"
          quality={User.height}
          setQuality={handleUpdate}
        />
        <div className="flex justify-center mb-5">
          <button
            className="bg-blue-200 shrink h-10 w-[80%] rounded-lg  font-buttonFont"
            type="submit"
          >
            Create Account
          </button>
        </div>
      </form>
    </div>
  );
}

//input component takes in a parameter of state and a setState function as well as a string to display the certain wanted input.
type FormTextInputProps = {
  value: keyof UserInfo;
  quality: string;
  setQuality: (field: keyof UserInfo, value: string) => void;
};

function FormTextInput({ value, quality, setQuality }: FormTextInputProps) {
  return (
    <div className="flex flex-col">
      <p className="font-buttonFont">
        {value === "height" ? `${value}(cm)` : value}
      </p>
      <input
        type={String(value) === "password" ? "password" : "text"}
        className="border-black border-2 w-full h-10 shrink my-3 rounded pl-2"
        value={quality}
        onChange={(e) => setQuality(value, e.target.value)}
        autoComplete={String(value) === "password" ? "on" : "off"}
      ></input>
    </div>
  );
}
