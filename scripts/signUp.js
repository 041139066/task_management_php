import { notification } from './utils.js';
import handleSubmit from './formUtils.js';
const form = document.getElementById('signup-form')
const name = document.getElementById('name')
const password = document.getElementById('password')
const rePassword = document.getElementById('re-password')
const signup = document.getElementById('signup-btn')
const fields = [
  [name, /^[A-Za-z0-9_]{1,255}$/, "Please enter a user name that is 1-255 characters long. Your user name may contain letters (both uppercase and lowercase), digits, and underscores."],
  [password, /^(?=.*[A-Z]).{8,}$/, "Please create a password that is at least 8 characters long and includes at least 1 uppercase letter."],
  [rePassword, () => password.value === rePassword.value, "Please match the password."]
]
const url = '../server/User/signUp'
const handleData = () => notification("Congratulations! You have successfully signed up!", "success").then(() => {
  window.location.href = "login.html"
})
const message = "Failed to sign up. Please review the provided information and try again."

handleSubmit(form, fields, signup, { url, handleData, message })



