import {
  BrowserRouter as Router,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import Home from "./Components/Home";
import Calories from "./Components/Calories/Calories";
import Workouts from "./Components/Workouts";
import Progress from "./Components/Progress";
import CreateAccount from "./Components/CreateAccount";
import Login from "./Components/Login";
import AuthProvider, { useAuth } from "./Components/Provider/authProvider";
import { useEffect } from "react";
import { isTokenExpired } from "./Components/Provider/checkToken";

function App() {
  return (
    <Router>
      <AuthProvider>
        <RouteLayout />
      </AuthProvider>
    </Router>
  );
}

const RouteLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!auth.token || isTokenExpired(auth.token)) {
      auth.setToken(null);
      navigate("/login");
    }
  }, [auth.token, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/calories" element={<Calories />}></Route>
      <Route path="/workouts" element={<Workouts />}></Route>
      <Route path="/progress" element={<Progress />}></Route>
      <Route path="/createacc" element={<CreateAccount />}></Route>
      <Route path="/login" element={<Login />}></Route>
    </Routes>
  );
};

export default App;
