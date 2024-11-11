import { Link } from "react-router-dom";

import LandingPage from "../../public/images/LandingPage.jpg";
import Navbar from "../Utils/Navbar";
export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="flex flex-col">
        <Welcome />
      </div>
    </div>
  );
}

//needs route to login user with google oauth when they click start today
function Welcome() {
  return (
    <div className="container relative h-[550px] w-4/5 my-7 mx-auto sm:min-w-5 md:min-w-fit">
      <img src={LandingPage} alt="Mountains" className="w-full h-full"></img>
      <div className="flex flex-col absolute top-1/3 left-1/2 transform -translate-x-1/2 md:top-1/4 md:left-[30%]">
        <h1 className="font-headerFont text-5xl md:text-7xl">SimpleTrack</h1>
        <Link
          to="/createacc"
          className="bg-white w-64 h-14 border-black border-2 rounded-md mx-auto my-5 md:my-14 font-buttonFont flex items-center justify-center"
        >
          Start Today!
        </Link>
      </div>
    </div>
  );
}
