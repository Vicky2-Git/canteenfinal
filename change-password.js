// change-password.js

document
  .getElementById("change-password-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Send the request to the server to change the password
    const response = await fetch("http://localhost:3000/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, newPassword }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Password changed successfully!");
      window.location.href = "login_page.html"; // Redirect to login page after success
    } else {
      alert(data.message || "Error occurred while changing password");
    }
  });
