// login.js

document
  .getElementById("login-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send login request to server
    const response = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (data.success) {
      // Store username in sessionStorage to persist until logout
      sessionStorage.setItem("username", username);
      // Redirect on successful login
      alert(data.message || "Login successful");
      window.location.href = "homepage.html"; // Redirect to homepage
    } else {
      // Display error message
      alert(data.message || "Invalid username or password");
    }
  });
