import mongoose from "mongoose";

const dailyMacrosSchema = new mongoose.Schema({
  calories: { type: Number, required: true },
  carbs: { type: Number, required: true },
  protein: { type: Number, required: true },
  time: { type: Number, required: true },
});

interface macroEntry {
  calories: Number;
  carbs: Number;
  protein: Number;
}
const macrosSchema = new mongoose.Schema<macroEntry>({
  calories: { type: Number, required: true },
  carbs: { type: Number, required: true },
  protein: { type: Number, required: true },
});

const dailyMealSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    dailyMacros: { type: [dailyMacrosSchema], required: true },
    weeklyMacros: { type: [macrosSchema], required: true },
  },
  {
    timestamps: true,
  }
);

const sepMacros = mongoose.model("sepMacros", macrosSchema);
const dailyMacros = mongoose.model("dailyMacros", dailyMacrosSchema);
const dailyMeal = mongoose.model("dailyMeal", dailyMealSchema);

export { dailyMacros, dailyMeal, sepMacros };
