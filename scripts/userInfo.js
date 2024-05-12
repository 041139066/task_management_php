import { notification, addLogout } from './utils.js';
import fetch from "./fetch.js"
import handleSubmit from './formUtils.js';
addLogout()
const avatar = document.getElementById("avatar")
const upload = document.getElementById("upload")
const form = document.getElementById('user-form')
const name = document.getElementById('name')
const email = document.getElementById('email')
const password = document.getElementById('password')
const rePassword = document.getElementById('re-password')
const submit = document.getElementById('submit-btn')

// set the initial user information from local storage
let avatarUrl = localStorage.getItem('avatar')
avatar.style.backgroundImage = `url(${avatarUrl && avatarUrl === 'null' ? avatarUrl : "../assets/images/avatar.png"})`
let user = JSON.parse(localStorage.getItem('user'))
name.value = user?.name
email.value = user?.email

// fetch user information
function fetchUserInfo () {
  upload.disabled = true
  upload.style.cursor = 'wait'
  submit.disabled = true
  submit.style.cursor = 'wait'
  fetch('../server/User/getUserInfo')
    .then(res => {
      if (res?.code === 0) {
        const { user: userInfo = {}, avatar: avatarObjUrl = '' } = res?.data
        user = userInfo
        avatarUrl = avatarObjUrl
        localStorage.setItem('avatar', avatarObjUrl)
        localStorage.setItem('user', JSON.stringify(userInfo))
        avatar.style.backgroundImage = `url(${avatarObjUrl || "../assets/images/avatar.png"})`
        name.value = userInfo.name
        email.value = userInfo.email
        password.value = ''
        rePassword.value = ''
      } else {
        throw new Error(res?.message || "Failed to get user information. Please refresh the page.");
      }
    }).catch(e => {
      console.error(e)
      notification(e.message, "error")
    }).finally(() => {
      upload.disabled = false
      upload.style.cursor = 'default'
      submit.disabled = false
      submit.style.cursor = 'default'
    })
}
fetchUserInfo()

// change avatar
const handleUpload = function () {
  const formData = new FormData(this);
  upload.disabled = true
  upload.style.cursor = "wait"
  fetch('../server/User/uploadAvatar', formData, { method: "form-data" })
    .then(res => {
      if (res?.code === 0) {
        localStorage.setItem('avatar', res.data);
        avatar.style.backgroundImage = `url(${res.data})`
        notification("Your avatar has been successfully updated!", "success")
      } else {
        throw new Error(res?.message || "Failed to update avatar. Please try again.")
      }
    }).catch(e => {
      console.error(e)
      notification(e.message, "error")
    }).finally(() => {
      upload.disabled = false
      upload.style.cursor = "default"
    })
}
upload.addEventListener("input", handleUpload)

// handle update 
const fields = [
  [email, /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/, "Please enter an email address with the format xyx@xyz.xyz"],
  [password, () => password.value === '' || /^(?=.*[A-Z]).{8,}$/.test(password.value), "Please create a password that is at least 8 characters long and includes at least 1 uppercase letter."],
  [rePassword, () => password.value === rePassword.value, "Please match the password."]
]
const url = '../server/User/updateUserById'
const handleData = data => notification("Congratulations! You have successfully update your profile!", "success").then(() => {
  console.log(data)
  user = data?.user || {}
  name.value = user?.name || ''
  email.value = user?.email || ''
  localStorage.setItem('token', data?.token)
  localStorage.setItem('user', JSON.stringify(user))
})
const message = "Failed to update your profile. Please review the provided information and try again."

handleSubmit(form, fields, submit, { url, handleData, message })

// handler on reset
form.addEventListener("reset", function () {
  setTimeout(() => { // set the value after resetting the value
    name.value = user.name
    email.value = user.email
  }, 0)
})









