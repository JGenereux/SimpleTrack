import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../Provider/authProvider";
import ViewMeals from "./ViewMeals";
import CalorieChart from "./CalorieChart";
import PercentageViewer from "./Percentage";

interface isAddedProps {
  isAdded: boolean;
  setIsAdded: (bool: boolean) => void;
}
export default function AddMeal({ isAdded, setIsAdded }: isAddedProps) {
  const [calorieGoal, setCalorieGoal] = useState<string>("");

  return (
    <div className="flex flex-col md:flex-row shadow-[#0ffcbd50] shadow-lg rounded-lg  w-fit md:w-[400px] lg:w-[1000px] h-fit md:ml-[5%] my-3 md:my-[1%] mr-5 ml-5 ">
      <div className="flex flex-col h-full w-full">
        <div className="h-1/2 md:h-full w-full md:w-full my-8 md:ml-5 lg:ml-0">
          <AddMealForm
            setIsAdded={setIsAdded}
            calorieGoal={calorieGoal}
            setCalorieGoal={setCalorieGoal}
          />
        </div>
      </div>
      <div className="flex flex-col mr-5 h-1/2 md:h-full m-fit md:w-full bg-transparent">
        <ViewMeals isAdded={isAdded} setIsAdded={setIsAdded} />
        <PercentageViewer calorieGoal={calorieGoal} />
        <CalorieChart isAdded={isAdded} />
      </div>
    </div>
  );
}

interface Meal {
  mealName: string;
  ingredients: StringPair[];
}
interface MealInfo {
  ingredients: string[];
  amounts: string[];
}
interface fullMacros {
  calories: number;
  carbs: number;
  protein: number;
}

interface AddMealsProps {
  setIsAdded: (added: boolean) => void;
  calorieGoal: string;
  setCalorieGoal: (goal: string) => void;
}

function AddMealForm({
  setIsAdded,
  calorieGoal,
  setCalorieGoal,
}: AddMealsProps) {
  const [meal, setMeal] = useState<Meal>({
    mealName: "",
    ingredients: [],
  });
  const [entireMacros, setEntireMacros] = useState<fullMacros | null>(null);

  const auth = useAuth();

  async function handleAddMeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const sepIngredients: string[] = [];
    const sepAmounts: string[] = [];
    meal.ingredients.map((ingredient) => {
      sepIngredients.push(ingredient.key);
      sepAmounts.push(ingredient.value);
    });

    const currInfo: MealInfo = {
      ingredients: sepIngredients,
      amounts: sepAmounts,
    };

    try {
      const { calories, carbs, protein } = await getMealMacros(currInfo);
      setEntireMacros({ calories: calories, carbs: carbs, protein: protein });
      await addMealEntry(calories, carbs, protein);
    } catch (error) {
      console.log(error);
    }
  }
  //Returns the amount for each individual macro in the user's meal
  async function getMealMacros(currInfo: MealInfo) {
    try {
      const res = await axios.post(
        "https://simple-track-server.vercel.app/calories/totalcalories",
        currInfo
      );
      return res.data;
    } catch (error) {
      console.log(error);
    }
  }

  //Takes the amounts from getMealMacros and logs it in the user's entries as a meal.
  async function addMealEntry(
    calories: number,
    carbs: number,
    protein: number
  ) {
    try {
      const mealMacros = {
        userEmail: auth.userEmail,
        calories: calories,
        carbs: carbs,
        protein: protein,
      };
      await axios.post(
        "https://simple-track-server.vercel.app/calories/insertMeal",
        mealMacros
      );
      //Set isAdded to true to trigger the ViewMeals component to render the new meals array.
      setIsAdded(true);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <Goal calorieGoal={calorieGoal} setCalorieGoal={setCalorieGoal} />
      <form onSubmit={(e) => handleAddMeal(e)} className="flex flex-col">
        <div className="flex flex-col md:mb-5">
          <div className="flex flex-col items-center">
            <FormTextInput meal={meal} setMeal={setMeal} />
            <FormIngredientsInput
              meal={meal}
              setMeal={setMeal}
              setIsAdded={setIsAdded}
            />
          </div>
          <p>{entireMacros?.calories}</p>
        </div>
      </form>
    </div>
  );
}

interface calorieGoalProps {
  calorieGoal: string;
  setCalorieGoal: (goal: string) => void;
}
function Goal({ calorieGoal, setCalorieGoal }: calorieGoalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const auth = useAuth();

  //Only mounts on first render in order to fetch the user's calorieGoal if they have one
  useEffect(() => {
    async function fetchGoal() {
      try {
        const res = await axios.get(
          `https://simple-track-server.vercel.app/calories/getGoal?userEmail=${auth.userEmail}`
        );
        const goal = res.data;
        if (goal != null) {
          setCalorieGoal(goal);
        }
      } catch (error) {
        console.log(error);
      }
    }
    fetchGoal();
  }, [isOpen, auth.userEmail]);

  async function updateGoal() {
    try {
      const updateGoalProps = {
        userEmail: auth.userEmail,
        goal: calorieGoal,
      };

      await axios.post(
        "https://simple-track-server.vercel.app/calories/setGoal",
        updateGoalProps
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleSetGoalClick() {
    if (isOpen) {
      updateGoal();
    }
    setIsOpen(!isOpen);
  }
  return (
    <div className="flex flex-row ml-5 mb-2">
      <button
        className="shadow-md p-1 bg-black text-white font-textFont"
        onClick={handleSetGoalClick}
      >
        Set Daily Goal
      </button>
      {isOpen && (
        <div className="self-center">
          <input
            type="text"
            value={calorieGoal}
            onChange={(e) => setCalorieGoal(String(e.target.value))}
            className="border-black border-2 w-16 pl-1"
          ></input>
        </div>
      )}
    </div>
  );
}
interface mealInputProps {
  meal: Meal;
  setMeal: React.Dispatch<React.SetStateAction<Meal>>;
}
function FormTextInput({ meal, setMeal }: mealInputProps) {
  const [mealname, setMealname] = useState("");

  useEffect(() => {
    const updatedMeal: Meal = { ...meal };
    updatedMeal.mealName = mealname;
    setMeal(updatedMeal);
  }, [mealname]);

  return (
    <div className="flex flex-col text-start my-6">
      <p className="text-2xl md:text-xl font-headerFont">Meal name</p>
      <input
        type="text"
        value={mealname}
        onChange={(e) => setMealname(e.target.value)}
        className="shadow-md shadow-gray-400 border-black border-[1px] rounded w-72 h-10 shrink my-3  pl-2"
      ></input>
    </div>
  );
}

interface StringPair {
  key: string;
  value: string;
  id: number;
}

interface FormIngredientsInputProps {
  meal: Meal;
  setMeal: React.Dispatch<React.SetStateAction<Meal>>;
  setIsAdded: (bool: boolean) => void;
}
function FormIngredientsInput({
  meal,
  setMeal,
  setIsAdded,
}: FormIngredientsInputProps) {
  const [rows, setRows] = useState<number[]>([1]);
  const [ingredients, setIngredients] = useState<StringPair[]>([]);

  useEffect(() => {
    if (ingredients.length == 0) return;
    const currMeal: Meal = { ...meal };
    currMeal.ingredients = ingredients;
    setMeal(currMeal);
  }, [ingredients]);

  return (
    <div className="flex flex-col lg:w-72  items-center">
      <table className="shadow-md bg-none">
        <thead>
          <tr className="font-headerFont">
            <th>Ingredient</th>
            <th>Amount (g)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <IngredientsEntryRows
              key={i}
              ingredients={ingredients}
              setIngredients={setIngredients}
              id={i}
              rows={rows}
              setRows={setRows}
              setIsAdded={setIsAdded}
            />
          ))}
        </tbody>
      </table>
      <button
        type="submit"
        className="h-12 w-32 rounded-lg text-white bg-black  shadow-md mt-5 font-buttonFont"
      >
        Get Macros!
      </button>
    </div>
  );
}

type sepIngredient = {
  id: number;
  ingredients: StringPair[];
  setIngredients: React.Dispatch<React.SetStateAction<StringPair[]>>;
  rows: number[];
  setRows: React.Dispatch<React.SetStateAction<number[]>>;
  setIsAdded: (bool: boolean) => void;
};

function IngredientsEntryRows({
  id,
  ingredients,
  setIngredients,
  rows,
  setRows,
  setIsAdded,
}: sepIngredient) {
  const [ingredient, setIngredient] = useState("");
  const [amount, setAmount] = useState("");
  const [addedRow, setAddedRow] = useState<boolean>(false);

  function updateIngredients() {
    if (ingredient === "" || amount === "") return;
    const rmvdIngredients = ingredients.filter((item) => item.id != id);
    rmvdIngredients.push({ id: id, key: ingredient, value: amount });
    setIngredients(rmvdIngredients);
  }
  useEffect(() => {
    setIsAdded(false);
    updateIngredients();
    //add a row for another ingredient input if a user has entered an amount
    //likewise for other condition just removes a row if user has removed the text from that row
    if (amount != "" && !addedRow) {
      setRows([...rows, rows.length + 1]);
      setAddedRow(true);
    }

    if (addedRow && amount == "") {
      const oneLessRows = rows.slice(0, -1);
      setRows(oneLessRows);
      setAddedRow(false);
    }
  }, [ingredient, amount]);

  return (
    <tr className="bg-none">
      <td>
        <input
          type="text"
          className="w-32 h-10 md:w-48 rounded mr-2 pl-2 border-black border-[1px]"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
        ></input>
      </td>
      <td>
        <input
          type="text"
          className="w-32 h-10 md:w-48 rounded mr-2 pl-2 border-black border-[1px]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        ></input>
      </td>
    </tr>
  );
}
