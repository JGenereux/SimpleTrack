import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../Provider/authProvider";

interface Meal {
  calories: number;
  carbs: number;
  protein: number;
  time: number;
}

interface AddMealsProps {
  isAdded: boolean;
  setIsAdded: (added: boolean) => void;
}
export default function ViewMeals({ isAdded, setIsAdded }: AddMealsProps) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const auth = useAuth();
  useEffect(() => {
    async function fetchMeals() {
      try {
        const res = await axios.get(
          `https://simple-track-server.vercel.app/retrieveDaily?userEmail=${auth.userEmail}`
        );
        const dMeals: Meal[] = res.data;
        setMeals(dMeals);
      } catch (error) {
        console.log(error);
      }
    }
    if (!loaded) {
      fetchMeals();
      setLoaded(true);
      return;
    } else if (isAdded) {
      fetchMeals();
    }
  }, [auth.userEmail, isAdded, loaded]);
  return (
    <div className="flex flex-col mx-auto md:items-end w-fit md:my-5 mb-7 md:mr-3 shadow-xl">
      {meals?.map((_meal, i) => (
        <Meal
          key={i}
          index={i}
          meals={meals}
          setMeals={setMeals}
          isAdded={isAdded}
          setIsAdded={setIsAdded}
        />
      ))}
    </div>
  );
}

interface MealProps {
  index: number;
  meals: Meal[];
  setMeals: (meal: Meal[]) => void;
  isAdded: boolean;
  setIsAdded: (bool: boolean) => void;
}
//component to load a individual meal component
//allows a user to view their meals through the day
//or edit/remove the meal if needed.
function Meal({ index, meals, setMeals, isAdded, setIsAdded }: MealProps) {
  const calories = meals[index].calories;
  const carbs = meals[index].carbs;
  const protein = meals[index].protein;

  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className="flex flex-col w-80 h-fit rounded-lg my-1 bg-[#161618] text-white">
      <div className="flex flex-row justify-center items-center">
        <p className="ml-2 my-2 font-headerFont">Meal {index + 1}</p>
        <button
          className="ml-auto mr-5 text-white md:text-lg w-5 h-5 rounded flex justify-center items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? `-` : `+`}
        </button>
      </div>
      <div className="flex flex-row mt-auto ml-2">
        {isOpen ? (
          <EditMeal
            index={index}
            meals={meals}
            setMeals={setMeals}
            isAdded={isAdded}
            setIsAdded={setIsAdded}
          />
        ) : (
          <p className="font-headerFont mb-2">
            Cals: {calories}, Carbs: {carbs}, Protein: {protein}{" "}
          </p>
        )}
      </div>
    </div>
  );
}

function EditMeal({ index, meals, setMeals, isAdded, setIsAdded }: MealProps) {
  const auth = useAuth();
  const [calories, setCalories] = useState(meals[index].calories);
  const [carbs, setCarbs] = useState(meals[index].carbs);
  const [protein, setProtein] = useState(meals[index].protein);

  const updateMacro = (macro: number, type: keyof Meal) => {
    if (type == "calories") {
      setCalories(macro);
    } else if (type == "carbs") {
      setCarbs(macro);
    } else if (type == "protein") {
      setProtein(macro);
    }
    const newMeal: Meal = {
      ...meals[index],
      [type]: macro,
    };
    const meal: Meal[] = meals;
    meal[index] = newMeal;
    setMeals(meal);
  };

  async function updateMeal() {
    const updateMeal = {
      userEmail: auth.userEmail,
      index: index,
      updatedMeals: meals,
    };

    try {
      await axios.post(
        "https://simple-track-server.vercel.app/calories/updateDaily",
        updateMeal
      );
      setIsAdded(!isAdded);
      console.log("Meal was successfully updated");
    } catch (error) {
      console.log(error);
    }
  }
  async function handleDeleteMeal() {
    //logic to update state to reflect deletion
    //creates a new array of the one reflected
    const modMeals: Meal[] = meals.filter((_meals, i) => index != i);
    setMeals(modMeals);

    const deleteReq = {
      userEmail: auth.userEmail,
      index: index,
    };
    try {
      const res = await axios.delete(
        "https://simple-track-server.vercel.app/calories/removeMeal",
        { data: deleteReq }
      );
      setIsAdded(!isAdded);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleMealUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    updateMeal();
  }
  return (
    <form className="flex flex-row" onSubmit={(e) => handleMealUpdate(e)}>
      <div className="flex flex-col">
        <p className="font-headerFont mb-2">Cals</p>
        <input
          type="text"
          value={calories}
          onChange={(e) => updateMacro(Number(e.target.value), "calories")}
          className="w-20"
        ></input>
      </div>
      <div>
        <p className="font-headerFont mb-2">Carbs</p>
        <input
          type="text"
          value={carbs}
          onChange={(e) => updateMacro(Number(e.target.value), "carbs")}
          className="w-20"
        ></input>
      </div>
      <div>
        <p className="font-headerFont mb-2">Protein</p>
        <input
          type="text"
          value={protein}
          onChange={(e) => updateMacro(Number(e.target.value), "protein")}
          className="w-20"
        ></input>
      </div>
      <div className="flex flex-col">
        <button type="submit">Submit</button>
        <button onClick={handleDeleteMeal}>Delete</button>
      </div>
    </form>
  );
}
//component to show percentage person is from there goal
//function GoalCompletion() {}
