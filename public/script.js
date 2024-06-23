async function sendMessage() {
  const message = document.getElementById("message").value;
  const responseElement = document.getElementById("response");

  try {
    const response = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const data = await response.json();
    responseElement.textContent = data.response;
  } catch (error) {
    console.error("Error:", error);
    responseElement.textContent = "An error occurred. Please try again.";
  }
}
