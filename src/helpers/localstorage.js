/**
 * Store data to localstorage.
 * @param {*} key 
 * @param {*} value 
 * @returns 
 */
export const setData = (key, value) => {
  if (value === undefined) {
    localStorage.removeItem(key);
    return value;
  }
  const data = JSON.stringify(value);
  localStorage.setItem(key, data);
  return value;
};

/**
 * Retrive data from localstorage
 * @param {*} key 
 * @returns 
 */

export const getData = (key) => {
  const data = localStorage.getItem(key);

  if (data == null || data === "" || data === "undefined" || data === "null") {
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};


/**
 * Remove all data from localstorage
 * @returns 
 */
export const removeAllData = () => {
    localStorage.clear();
    return null;
}

/**
 * Remove data from localstorage
 * @param {*} key 
 * @returns 
 */
export const removeData = (key) => {
    localStorage.removeItem(key);
    return null;
}