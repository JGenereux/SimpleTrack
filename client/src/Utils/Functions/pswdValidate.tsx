/** Validates a user inputted password by verifying it meets the following criteria,
 * a password must have at least 8 characters, a special character, and at least a single number.
 */
export default function ValidatePswd(password: string): boolean {
  if (
    password.length >= 8 &&
    //uses a regex expression to check if the password contains a special character or a number.
    password.search(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/) !== -1 &&
    password.search(/[0-9]/) !== -1
  )
    return true;

  window.alert(
    "Password is not valid. Must contain at least 8 characters, a symbol, and 1 digit"
  );
  return false;
}
