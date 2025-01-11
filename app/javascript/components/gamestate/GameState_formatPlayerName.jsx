// Format the opponent's email (titleize and remove domain if it's an email)
export const formatPlayerName = (email) => {
  if (!email) return "Opponent";

  // Remove email domain if present
  const name = email.split("@")[0];

  // Titleize: capitalize each word, replace underscores/dots with spaces
  return name
    .replace(/[._]/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
