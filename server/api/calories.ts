import express from "express";
import axios, { all } from "axios";
import { dailyMacros, dailyMeal, sepMacros } from "../Models/dailyMeals";

import dotenv from "dotenv";
dotenv.config();
const millisecondsIn24Hours = 24 * 60 * 60 * 1000;
const caloriesRouter = express.Router();

const APP_ID = process.env.APP_ID;
const APP_KEY = process.env.APP_KEY;

const NUTRITIONIX_API_URL =
  "https://trackapi.nutritionix.com/v2/natural/nutrients";

interface foodMacros {
  food_name: string;
  nf_calories: number;
  nf_total_carbohydrate: number;
  nf_protein: number;
}
async function getMacroData(
  ingredient: string[]
): Promise<Record<string, any> | null> {
  try {
    const response = await axios.post(
      NUTRITIONIX_API_URL,
      {
        query: ingredient.join(", "),
      },
      {
        headers: {
          "x-app-id": APP_ID,
          "x-app-key": APP_KEY,
        },
      }
    );
    return response.data as Record<string, any>;
  } catch (error: any) {
    console.log(error);
    return null;
  }
}

caloriesRouter.post("/totalcalories", async (req, res) => {
  try {
    const { ingredients, amounts } = req.body;
    const data = await getMacroData(ingredients);
    if (!data) {
      res.status(400).json("Incomplete request for calories, check data");
      return;
    }
    const allMacros = calculateMacros(data, amounts);
    res.json(allMacros);
  } catch (error: any) {
    res.status(500).json(error);
  }
});

interface macrosForMeal {
  calories: Number;
  carbs: Number;
  protein: Number;
}

//Helper function for the totalcalories post route.
//Takes in the macros for each ingredient and uses each ingredients individual amount to accurately
//figure out the amount of macros in that individual ingredient.
//returns an object containing the total calories, protein, and carbs consumed for the meal given.
function calculateMacros(
  data: Record<string, any>,
  amounts: string[]
): macrosForMeal {
  let count = Object.keys(data["foods"]).length;
  let totalCalories = 0,
    totalCarbs = 0,
    totalProtein = 0;
  //An assumption is made that could lead to error
  //the nutrition API will always return the queries
  //in order given, so data["foods"][i] and amount[i]
  //should always be corresponding.
  for (let i = 0; i < count; i++) {
    const currFood = data["foods"][i];
    const {
      food_name,
      nf_calories,
      nf_total_carbohydrate,
      nf_protein,
      serving_weight_grams,
    } = currFood;
    //All nf variables(ex. calories) return values are based off how many there are per serving_weight in grams
    //so the total amount of an nf variable in food is the number of servings in that meal * the nf_variable
    const servingWeight = Number(amounts[i]) / serving_weight_grams;
    totalCalories += servingWeight * nf_calories;
    totalCarbs += servingWeight * nf_total_carbohydrate;
    totalProtein += servingWeight * nf_protein;
  }

  const fullMacros: macrosForMeal = {
    calories: Number(totalCalories.toFixed(2)),
    carbs: Number(totalCarbs.toFixed(2)),
    protein: Number(totalProtein.toFixed(2)),
  };
  return fullMacros;
}

interface macroEntry {
  calories: Number;
  carbs: Number;
  protein: Number;
}

interface weeklyMacros {
  weeklyMacros: macroEntry[];
}
//Post route to add a meal's macros for a user into db
caloriesRouter.post("/insertMeal", async (req, res) => {
  try {
    const { userEmail, calories, carbs, protein } = req.body;
    const timestamp = Date.now();
    const existingUser = await dailyMeal.findOne({ userEmail: userEmail });

    const currMealEntry = new dailyMacros({
      calories: calories,
      carbs: carbs,
      protein: protein,
      time: timestamp,
    });

    if (!existingUser) {
      //create new dailyMacros array to store the user's macros for the next 24 hours.
      const firstDailyEntry = new dailyMeal({
        userEmail: userEmail,
        dailyMacros: [currMealEntry],
        weeklyMacros: [{ calories: calories, carbs: carbs, protein: protein }],
      });
      await firstDailyEntry.save();
      res.status(201).json("User's meal was added successfully");
      return;
    }

    //compare current time with first entry and see if time elapsed since first meal is > 24
    //if so clear the array and make the array just the new meal else add the meal.

    if (existingUser.dailyMacros.length === 0) {
      existingUser.set("dailyMacros", [currMealEntry]);
      const currentDayOfWeek = existingUser.weeklyMacros.length - 1;
      existingUser.weeklyMacros[currentDayOfWeek].calories += calories;
      existingUser.weeklyMacros[currentDayOfWeek].carbs += carbs;
      existingUser.weeklyMacros[currentDayOfWeek].protein += protein;
      await existingUser.save();
      res.status(201).json("User's meal was added successfully");
      return;
    }

    const firstMealTime = existingUser.dailyMacros[0].time;
    if (timestamp - firstMealTime > millisecondsIn24Hours) {
      //a week has been completed if weeklyMacros.length == 7 (since it stores daily total macros)
      if (existingUser.weeklyMacros.length == 7) {
        await dailyMeal.updateOne(
          {
            userEmail: userEmail,
          },
          { $shift: { weeklyMacros: {} } } //Removes the first element in weeklyMacros
        );
      }
      existingUser.set("dailyMacros", [currMealEntry]);
      existingUser.weeklyMacros.push({
        calories: calories,
        carbs: carbs,
        protein: protein,
      });
    } else {
      //add macros for current meal to dailyMacros array
      existingUser.dailyMacros.push(currMealEntry);
      //Sum up the total calories, carbs, and protein intake for the day in weeklyMacros.
      const currentDayOfWeek = existingUser.weeklyMacros.length - 1;
      existingUser.weeklyMacros[currentDayOfWeek].calories += calories;
      existingUser.weeklyMacros[currentDayOfWeek].carbs += carbs;
      existingUser.weeklyMacros[currentDayOfWeek].protein += protein;
    }
    //save changes to user's info in database
    await existingUser.save();

    res.status(201).json("User's meal was added successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

interface macroEntries {
  calories: Number[];
  carbs: Number[];
  protein: Number[];
}
//Returns the user's weeklymacros as an object where each category of macros
//are split into their own weekly macro array.
caloriesRouter.get("/retrieveWeek", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const user = await dailyMeal.findOne({ userEmail: userEmail });

    const macroData: macroEntries = {
      calories: [],
      carbs: [],
      protein: [],
    };

    if (user) {
      for (let i = 0; i < user.weeklyMacros.length; i++) {
        macroData.calories.push(user.weeklyMacros[i].calories);
        macroData.carbs.push(user.weeklyMacros[i].carbs);
        macroData.protein.push(user.weeklyMacros[i].protein);
      }
      res.json(macroData);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.json(error);
  }
});

//route to get user's daily meals (a lot more simple than the other routes)
caloriesRouter.get("/retrieveDaily", async (req, res) => {
  try {
    const userEmail = req.query.userEmail;
    const user = await dailyMeal.findOne({ userEmail: userEmail });

    if (!user) {
      res.status(404).json("User doesn't exist!");
      return;
    }
    res.status(200).json(user.dailyMacros);
  } catch (error) {
    res.status(404).json(error);
  }
});

//route to update a user's meal.
//Uses the index of the meal and userEmail to find the email and update it

//adjust current day totals in weekly macros to match the adjustments made.
caloriesRouter.post("/updateDaily", async (req, res) => {
  try {
    const { userEmail, updatedMeals, index } = req.body;
    const user = await dailyMeal.findOne({ userEmail: userEmail });
    if (!user) {
      res.status(406).json("User doesn't exist");
      return;
    }

    const calorieDiff =
      updatedMeals[index].calories - user.dailyMacros[index].calories;
    const carbsDiff = updatedMeals[index].carbs - user.dailyMacros[index].carbs;
    const proteinDiff =
      updatedMeals[index].protein - user.dailyMacros[index].protein;

    const currDay = user.weeklyMacros.length - 1;
    user.weeklyMacros[currDay].calories =
      Number(user.weeklyMacros[currDay].calories) + calorieDiff;
    user.weeklyMacros[currDay].carbs =
      Number(user.weeklyMacros[currDay].carbs) + carbsDiff;
    user.weeklyMacros[currDay].protein =
      Number(user.weeklyMacros[currDay].protein) + proteinDiff;

    user.dailyMacros = updatedMeals;
    await user.save();
    res.status(200).json(user.dailyMacros);
  } catch (error) {
    res.status(404).json(error);
  }
});

caloriesRouter.delete("/removeMeal", async (req, res) => {
  const { userEmail, index } = req.body;
  console.log(userEmail);
  try {
    const user = await dailyMeal.findOne({ userEmail: userEmail });

    if (!user) {
      res.status(404).json("User doesn't exist");
      return;
    }
    //get requested meal that user wants to remove so the dailyMacros total can be adjusted.
    const reqMeal = user.dailyMacros[index];

    const currDay = user.weeklyMacros.length - 1;
    const calories = Number(user.weeklyMacros[currDay].calories);
    const carbs = Number(user.weeklyMacros[currDay].carbs);
    const protein = Number(user.weeklyMacros[currDay].protein);
    if (calories - reqMeal.calories >= 0) {
      user.weeklyMacros[currDay].calories = calories - reqMeal.calories;
    }
    if (carbs - reqMeal.carbs >= 0) {
      user.weeklyMacros[currDay].carbs = carbs - reqMeal.carbs;
    }
    if (protein - reqMeal.protein >= 0) {
      user.weeklyMacros[currDay].protein = protein - reqMeal.protein;
    }
    user.dailyMacros.splice(index, 1);
    await user.save();
    res.status(200).json("Meal removed");
  } catch (error) {
    res.status(500).json(error);
  }
});

//Route to set the users daily calorie goal
caloriesRouter.post("/setGoal", async (req, res) => {
  const { userEmail, goal } = req.body;
  try {
    //get user from db
    const user = await dailyMeal.findOne({ userEmail: userEmail });

    if (user == null) {
      res.status(406).json("User not found");
      return;
    }
    //if the user exists set the current goal for the user
    user.goal = goal;
    await user.save();
    res.status(200).json("Goal set successfully");
  } catch (error) {
    res.status(404).json(error);
  }
});

//Route to retrieve the users daily calorie goal
caloriesRouter.get("/getGoal", async (req, res) => {
  const userEmail = req.query.userEmail;
  try {
    const user = await dailyMeal.findOne({ userEmail: userEmail });
    if (user == null) {
      res.status(406).json("User not found");
      return;
    }

    const usersGoal = user.goal;
    res.status(200).json(usersGoal);
  } catch (error) {
    res.status(404).json(error);
  }
});
export default caloriesRouter;
