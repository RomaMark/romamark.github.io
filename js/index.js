async function login() {
  const usernameOrEmail = document.getElementById("usernameOrEmail").value;
  const password = document.getElementById("password").value;

  const credentials = btoa(`${usernameOrEmail}:${password}`);

  try {
    const response = await fetch("https://01.kood.tech/api/auth/signin", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const jwtToken = data.token;

      // Save the JWT token to localStorage or sessionStorage
      // For simplicity, saving to localStorage in this example
      localStorage.setItem("jwtToken", jwtToken);

      // Redirect or perform any other action after successful login
      window.location.href = "mainpage.html";
    } else {
      // Handle authentication failure
      const errorMessage = "User does not exist or password incorrect";
      document.getElementById("errorMessage").innerText = errorMessage;
    }
  } catch (error) {
    console.error("Error during login:", error);
  }
}
