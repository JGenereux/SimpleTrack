import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../Provider/authProvider";

interface calorieGoalProps {
  calorieGoal: string;
}

interface macroEntries {
  calories: number[];
  carbs: number[];
  protein: number[];
}
export default function PercentageViewer({ calorieGoal }: calorieGoalProps) {
  const [percentage, setPercentage] = useState<string>("0");
  const auth = useAuth();

  useEffect(() => {
    async function calculatePercentToGoal() {
      try {
        const res = await axios.get(
          `https://simple-track-server.vercel.app/calories/retrieveWeek?userEmail=${auth.userEmail}`
        );

        const macroData: macroEntries = res.data;
        const currentDailyIntake: number =
          macroData.calories[macroData.calories.length - 1];

        const percent = (currentDailyIntake / Number(calorieGoal)) * 100;
        setPercentage(percent.toFixed(2));
      } catch (error) {
        console.log(error);
      }
    }
    calculatePercentToGoal();
  }, [calorieGoal, auth.userEmail]);
  return (
    <div className="mb-10 my-5 mr-5">
      <div className="flex justify-self-center md:justify-self-end  mb-1">
        <span className="text-sm font-medium dark:text-black">
          {percentage}%
        </span>
      </div>
      <div className="w-3/4 justify-self-center md:justify-self-end bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%`, maxWidth: "100%", minWidth: "0%" }}
        ></div>
      </div>
    </div>
  );
}
