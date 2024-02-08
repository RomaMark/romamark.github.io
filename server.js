import * as fn from "./functions.js";

var JWT;

if (!window.location.href.endsWith("mainpage.html")) {
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (event) {
      event.preventDefault();

      const usernameInput = document.getElementById("username").value;
      const passwordInput = document.getElementById("password").value;

      if ((await authenticateUser(usernameInput, passwordInput)) == true) {
        console.log("Delayed value of JWT", JWT);
        sessionStorage.setItem("JWT", JWT);
        window.location.href = "mainpage.html";
      } else {
        alert("Invalid username or password. Please try again.");
      }
    });
}

async function authenticateUser(username, password) {
  try {
    JWT = await fn.loginUser(username, password);
    return typeof JWT === "string";
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

export function getJWT() {
  return JWT;
}
