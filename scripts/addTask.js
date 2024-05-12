import { notification, addLogout } from './utils.js';
import handleSubmit from './formUtils.js';
addLogout()

// handle login
const form = document.getElementById('addtask-form')
const title = document.getElementById("title")
const description = document.getElementById("description")
const submit = document.getElementById('submit-btn')

const fields = [
  [title, /\S/, "Please enter a task title."],
  [description, /\S/, "Please write the description of the task."],
]
const url = '../server/Task/addTask'
const handleData = () => notification("Congratulations! You have successfully added a new task!", "success").then(() => {
  window.location.href = "../pages/home.html"
})
const message = "Failed to add the task. Please try again."

handleSubmit(form, fields, submit, { url, handleData, message })

