// register.js

document
  .getElementById("register-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = document.getElementById("new-username").value;
    const email = document.getElementById("new-email").value;
    const Regno = document.getElementById("new-mobile").value;
    const password = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    // Send registration request to server
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, Regno, password }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Registration successful!");
      window.location.href = "login_page.html";
    } else {
      alert(data.message || "Registration failed");
    }
  });
