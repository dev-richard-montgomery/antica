export const generateHexId = () => {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
};