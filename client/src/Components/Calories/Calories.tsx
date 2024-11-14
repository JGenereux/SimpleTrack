import { useState } from "react";
import Navbar from "../../Utils/Navbar";
import AddMeal from "./AddMealForm";

export default function Calories() {
  const [isAdded, setIsAdded] = useState<boolean>(false);
  return (
    <div className="bg-[#161618]">
      <Navbar />
      <div className="flex flex-col mt-20 justify-center md:justify-normal">
        <AddMeal isAdded={isAdded} setIsAdded={setIsAdded} />
      </div>
    </div>
  );
}
