/** Validates a string containing the user's inputted email
    checks to ensure it contains an @ and a .
    (it does not check if the email exists as an account that is done on submit/login)
*/
export default function ValidateEmail(email: string): boolean {
  let atSymbs = 0;
  let periods = 0;
  for (let i = 0; i < email.length; i++) {
    if (email[i] == "@") {
      atSymbs++;
    }
    if (email[i] == ".") {
      periods++;
    }
  }

  if (atSymbs > 0 && periods > 0) {
    return true;
  }
  window.alert("Email must contain an @ followed by a .");
  return false;
}
