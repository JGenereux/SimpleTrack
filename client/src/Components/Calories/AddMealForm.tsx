import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../Provider/authProvider";
import ViewMeals from "./ViewMeals";

interface isAddedProps {
  isAdded: boolean;
  setIsAdded: (bool: boolean) => void;
}
export default function AddMeal({ isAdded, setIsAdded }: isAddedProps) {
  return (
    <div className="flex flex-col md:flex-row shadow-xl rounded-lg  min-w-fit lg:w-[1000px] h-fit md:ml-[5%] my-10 md:my-[2%] bg-white">
      <div className="flex flex-col h-full w-full">
        <div className="h-1/2 md:h-full w-full md:w-full my-8">
          <AddMealForm setIsAdded={setIsAdded} />
        </div>
      </div>
      <div className="h-1/2 md:h-full w-full md:w-full bg-transparent">
        <ViewMeals isAdded={isAdded} setIsAdded={setIsAdded} />
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
}

function AddMealForm({ setIsAdded }: AddMealsProps) {
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
      const addMealResponse = await axios.post(
        "https://simple-track-server.vercel.app/calories/insertMeal",
        mealMacros
      );
      //Set isAdded to true to trigger the ViewMeals component to render the new meals array.
      setIsAdded(true);
      console.log(addMealResponse);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <form
      onSubmit={(e) => handleAddMeal(e)}
      className="flex flex-col items-center"
    >
      <div className="flex flex-col md:mb-5">
        <FormTextInput meal={meal} setMeal={setMeal} />
        <FormIngredientsInput
          meal={meal}
          setMeal={setMeal}
          setIsAdded={setIsAdded}
        />
        <p>{entireMacros?.calories}</p>
      </div>
    </form>
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
    <div className="flex flex-col  items-center">
      <p className="text-lg md:text-xl font-textFont">Meal name</p>
      <input
        type="text"
        value={mealname}
        onChange={(e) => setMealname(e.target.value)}
        className="shadow-md shadow-gray-400 rounded w-72 h-10 shrink my-3 border-black border-2 pl-2"
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
    <div className="flex flex-col lg:w-72 lg:my-5 items-center">
      <table className="shadow-xl bg-none border-black border-2">
        <thead>
          <tr className="font-buttonFont">
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
        className="h-12 w-32 rounded-lg shadow-gray-600 shadow-md mt-5 font-buttonFont"
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
          className="w-32 h-10 md:w-48 rounded mr-2 border-2 pl-2"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
        ></input>
      </td>
      <td>
        <input
          type="text"
          className="w-32 h-10 md:w-48 rounded mr-2 border-2 pl-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        ></input>
      </td>
    </tr>
  );
}
