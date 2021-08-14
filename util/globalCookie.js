module.exports = () => {
  let allCookies = {};
  let userCookie = {};

  try {
    allCookies = jsonFile.readFileSync('data/allCookies.json')
  } catch (err) {
    // get allCookies failed
  }

  try {
    userCookie = jsonFile.readFileSync('data/cookie.json')
  } catch (err) {
    // get cookie failed
  }

  return {
    allCookies: () => allCookies,
    userCookie: () => userCookie,
    updateAllCookies: (v) => allCookies = v,
    updateUserCookie: (v) => userCookie = v,
  }
}