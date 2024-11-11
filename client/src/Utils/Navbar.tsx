import { Link } from "react-router-dom";
import AccountIcon from "../images/AccountIcon.svg";
import { useState } from "react";
import { useAuth } from "../Components/Provider/authProvider";

export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  return (
    <div className="flex bg-blue-300 flex-col md:flex-row items-center min-w-fit min-h-fit md:min-h-12 font-mono z-50 relative">
      <h3 className="mx-3">SimpleTrack</h3>
      <Link to="/" className="mx-3">
        Home
      </Link>
      <Link to="/calories" className="mx-3">
        Calories
      </Link>
      <Link to="/workouts" className="mx-3">
        Workouts
      </Link>
      <Link to="/progress" className="mx-3">
        Progress
      </Link>
      {profileOpen ? (
        <div className="mr-auto ml-auto">
          <Profile setProfileOpen={setProfileOpen} />
        </div>
      ) : (
        <img
          src={AccountIcon}
          onClick={() => setProfileOpen(true)}
          className="h-7 w-7 md:ml-auto md:mr-5 cursor-pointer"
        ></img>
      )}
    </div>
  );
}
type ProfileProps = {
  setProfileOpen: (isOpen: boolean) => void;
};

function Profile({ setProfileOpen }: ProfileProps) {
  const auth = useAuth();

  function handleLogout() {
    auth.setToken(null);
    auth.setUserEmail(null);
  }
  return (
    <div className="flex flex-col w-40 md:w-60 md:h-fit bg-white md:absolute right-0 top-0 mr-1">
      <img
        src={AccountIcon}
        onClick={() => setProfileOpen(false)}
        className="h-7 w-7 cursor-pointer mx-auto md:mr-5 my-3"
      ></img>
      <div className="flex flex-col items-center md:items-end">
        <p className="">Username</p>
        <p>{auth.userEmail}</p>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
