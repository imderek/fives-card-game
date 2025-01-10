export const createNewGame = async (botEmail) => {
  try {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
    const difficulty = botEmail?.split(" ")[0]; // Gets 'easy', 'medium', or 'hard'

    const response = await fetch("/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({
        game: {
          bot_difficulty: difficulty,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      window.location.href = `/games/${data.id}`;
    }
  } catch (error) {
    console.error("Error creating new game:", error);
  }
};
