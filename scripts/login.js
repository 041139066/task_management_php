import { notification } from './utils.js';
import fetch from './fetch.js'
import handleSubmit from './formUtils.js';

// if the user is logged in, retrieve and update the user information and jump to the home page
const token = localStorage.getItem("token")
if (token && token !== 'null') {
  fetch('../server/User/getUserInfo').then(res => {
    if (res?.code === 0) {
      const {avatar = '', user = {}} = res?.data
      localStorage.setItem('avatar', avatar)
      localStorage.setItem('user', JSON.stringify(user))
      window.location.href = "../pages/home.html"
    } else {
      throw new Error(res?.message || "Failed to fetch user information.");
    }
  }).catch(e => {
    localStorage.clear()
    console.err(e)
  })
}

// handle login
const form = document.getElementById('login-form')
const account = document.getElementById('account')
const password = document.getElementById('password')
const login = document.getElementById('login-btn')
const fields = [
  [account, /\S/, "Please enter a user name or email."],
  [password, /\S/, "Please enter the password."],
]
const url = '../server/User/login'
const handleData = data => {
  const {token = '', avatar = '', user = {}} = data
  // store the token, avatar and user information to loacal storage
  localStorage.setItem('token', token)
  localStorage.setItem('avatar', avatar)
  localStorage.setItem('user', JSON.stringify(user))
  // jump to the home page
  notification(`Welcome back ${user.name}!`, "success").then(() => {
    window.location.href = "../pages/home.html"
  })
}
const message = "Login unsuccessful. Please check your credentials and try again."

handleSubmit(form, fields, login, { url, handleData, message })

console.dir(document)