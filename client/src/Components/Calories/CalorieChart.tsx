import { useEffect, useState } from "react";
import { useAuth } from "../Provider/authProvider";
import axios from "axios";
import {
  Chart as ChartJs,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";

ChartJs.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface weeklyMacros {
  calories: number[];
  carbs: number[];
  protein: number[];
}
interface DataSetPoints {
  x: number;
  y: number;
}
interface DataSet {
  macro: string;
  points: DataSetPoints[];
}

interface isAddedProps {
  isAdded: boolean;
}
const LineChart = ({ isAdded }: isAddedProps) => {
  const [macroChoice, setMacroChoice] = useState<number>(1);
  const [weeklyMacros, setWeeklyMacros] = useState<weeklyMacros>({
    calories: [],
    carbs: [],
    protein: [],
  });
  const [dataSet, setDataSet] = useState<DataSet>({
    macro: "",
    points: [],
  });
  const auth = useAuth();

  //useEffect to load arrays in weeklyMacros when component first mounts in order to
  //create graphs
  useEffect(() => {
    async function loadData() {
      try {
        const response = await axios.get(
          `https://simple-track-server.vercel.app/calories/retrieveWeek?userEmail=${auth.userEmail}`
        ); //route that returns weeklymacros
        const { calories, carbs, protein } = response.data; //destructure each array
        console.log(response.data);
        setWeeklyMacros({ calories: calories, carbs: carbs, protein: protein });
      } catch (error) {
        console.log(error);
      }
    }
    loadData();
  }, [auth.userEmail, isAdded]);
  // Define data for the chart

  useEffect(() => {
    //takes in an array of weekly macros for an individual macro like calories and returns an array with
    //x domain (0,7) and y domain (0, all days tracked in the last 7 days)
    const createDataSet = (macroChoice: string, weeklyMacro: number[]) => {
      const arr: DataSetPoints[] = [];
      for (let i = 0; i < 7; i++) {
        if (weeklyMacros.calories.length - 1 < i) {
          arr.push({ x: i + 1, y: 0 });
        } else {
          arr.push({ x: i + 1, y: weeklyMacro[i] });
        }
      }

      const currData: DataSet = {
        macro: macroChoice,
        points: arr,
      };
      setDataSet(currData);
    };

    if (macroChoice === 1 && weeklyMacros.calories) {
      createDataSet("Calories", weeklyMacros.calories);
    } else if (macroChoice === 2 && weeklyMacros.carbs) {
      createDataSet("Carbs", weeklyMacros.carbs);
    } else if (macroChoice === 3 && weeklyMacros.protein) {
      createDataSet("Protein", weeklyMacros.protein);
    }
  }, [weeklyMacros, macroChoice]);

  const data = {
    datasets: [
      {
        label: `Weekly ${dataSet.macro} Intake`,
        data: dataSet.points,
        backgroundColor: "rgb(75, 192, 192)",
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        title: {
          display: true,
          text: "Days",
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: `${dataSet.macro}`,
        },
        beginAtZero: true,
      },
    },
    maintainAspectRatio: true,
  };
  return (
    <div className="flex flex-col w-fit h-full mx-auto items-center bg-white">
      <div className="mr-5">
        <Scatter
          data={data}
          options={options}
          className=" h-[200px] md:w-[400px] md:h-[400px]"
        />
      </div>
      <div className="flex flex-row gap-5 mb-5 my-5">
        <button
          className="border-black rounded border-2 h-4 w-4"
          onClick={() => setMacroChoice(1)}
        ></button>
        <button
          className="border-black rounded border-2 h-4 w-4"
          onClick={() => setMacroChoice(2)}
        ></button>
        <button
          className="border-black rounded border-2 h-4 w-4"
          onClick={() => setMacroChoice(3)}
        ></button>
      </div>
    </div>
  );
};

export default LineChart;
