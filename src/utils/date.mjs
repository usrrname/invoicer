/**
 * Gets the current date in the format YYYY-MM-DD
 * @returns {string} The current date
 */
export const getCurrentDate = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const day = new Date().getDate();
    return `${year}-${month}-${day}`;
};