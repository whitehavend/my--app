export const formatEmail = (email) => {
  const string = email;
  const array = email.split("");
  const index = array.indexOf("@");
  const name = string.slice(0, index);
  return name;
};
