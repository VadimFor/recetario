export const randomAvatars = [
  "https://randomuser.me/api/portraits/men/11.jpg",
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/men/13.jpg",
  "https://randomuser.me/api/portraits/women/14.jpg",
  "https://randomuser.me/api/portraits/men/15.jpg",
  "https://randomuser.me/api/portraits/women/16.jpg",
  "https://randomuser.me/api/portraits/men/17.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
];

export const getRandomAvatar = (chatId: string | number) =>
  randomAvatars[Number(chatId) % randomAvatars.length];

export const formatMessageTime = (createdAt: string) => {
  const date = new Date(createdAt); // UTC ISO
  const now = new Date();

  const diffDays = Math.floor(
    (new Date(now).setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) /
      86400000
  );

  if (diffDays === 0) {
    // get local hours and minutes manually
    const hours = date.getHours() + 2; // local hour
    const minutes = date.getMinutes();
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
  }

  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "long" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};