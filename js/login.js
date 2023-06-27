import { getUsers, changeStatus } from "./get-modules.js";
let registerButton = document.querySelector(".main__register--button");
let registerName = document.querySelector(".main__register--name");
let registerAdress = document.querySelector(".main__register--email");
let registerPassword = document.querySelector(".main__register--password");
let registerPasswordVerify = document.querySelector(
  ".main__register--password-verify"
);
let loginEmail = document.querySelector(".main__login--email");
let loginPassword = document.querySelector(".main__login--password");
let loginButton = document.querySelector(".main__login--button");
let errorPassword = document.querySelector(".main__error--password");
let errorEmail = document.querySelector(".main__error--email");
let errorPasswordRegister = document.querySelector(
  ".main__error--password-register"
);
let errorEmailRegister = document.querySelector(".main__error--email-register");
let userExist = document.querySelector(".main__error--exist-register");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

registerButton.addEventListener("click", () => {
  validateRegistration(
    registerName.value,
    registerAdress.value,
    registerPassword.value,
    registerPasswordVerify.value
  );
});

loginButton.addEventListener("click", () => {
  checkUser(loginEmail.value, loginPassword.value);
});

async function checkUser(email, password){
  let usersArr = await getUsers();
  const userCheck = usersArr.find(el => el.email === email)
  if(!userCheck){
    errorEmail.classList.add("main__error--email-display");
    errorPassword.classList.remove("main__error--password-display");
    return;
  }
  if (userCheck.password !== password) {
    errorEmail.classList.remove("main__error--email-display");
    errorPassword.classList.add("main__error--password-display");
    return;
  }
  const user = await changeStatus(userCheck, 'true');
  localStorage.setItem("loggedUser", JSON.stringify(user));
  window.location.replace("../../index.html"); 
}

function validateRegistration(name, email, password, passwordVerify) {
  if (emailRegex.test(email)) {
    errorEmailRegister.classList.remove("main__error--email-register-display");
  } else {
    errorEmailRegister.classList.add("main__error--email-register-display");
    return;
  }

  if (password === passwordVerify && password.length > 4) {
    errorPasswordRegister.classList.remove(
      "main__error--password-register-display"
    );
  } else {
    errorPasswordRegister.classList.add(
      "main__error--password-register-display"
    );
    return;
  }

  registerUser(name, email, password);
}

async function registerUser(name, email, password) {
  let usersArr = await getUsers();
  let newUser = {};
  for (let i = 0; i < usersArr.length; i++) {
    if (email === usersArr[i].email) {
      userExist.classList.add("main__error--exist-register-display");
      return;
    } else {
      userExist.classList.remove("main__error--exist-register-display");
      newUser = {
        name: name,
        email: email,
        password: password,
        status: true,
      };
    }
  }
  let registration = await fetch(
    "https://634e9f834af5fdff3a625f84.mockapi.io/users",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    }
  ).then((res) => res.json());
  newUser = {...registration}
  localStorage.setItem("loggedUser", JSON.stringify(newUser));
  window.location.replace("../../index.html");
}
