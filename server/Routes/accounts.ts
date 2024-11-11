import express from "express";
import account from "../Models/account";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const accountsRouter = express.Router();

//route to create an account
accountsRouter.post("/createAccount", async (req, res) => {
  const { username, email, password, height, weight } = req.body;
  try {
    //check if the user already has an account with provided email
    const userExist = await account.findOne({ email: email });
    if (userExist != null) {
      res.status(404).json("USER ALREADY EXISTS");
      return;
    }
    const hashedPswd = await bcrypt.hash(password, 10);
    //create account in db
    const newAccount = new account({
      username: username,
      email: email,
      password: hashedPswd,
      height: height,
      weight: weight,
    });
    await newAccount.save();
    res.json("Account successfully created");
  } catch (error) {
    res.status(500).json(error);
  }
});

//Route to verify user credentials on login
accountsRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    //check if user exists
    const user = await account.findOne({ email: email });
    if (user === null) {
      res
        .status(406)
        .json("This user doesn't exist or entered the wrong credentials");
      return;
    }
    //check if password matches
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res
        .status(406)
        .json("This user doesn't exist or entered the wrong credentials");
      return;
    }

    //Generate JWT token
    const token = jwt.sign({ email: email }, "SECRET", { expiresIn: "1h" });
    res.status(200).json(String(token));
  } catch (error) {
    res.status(404).json(error);
  }
});

export default accountsRouter;
