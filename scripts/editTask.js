import { notification, addLogout } from './utils.js';
import fetch from './fetch.js';
import handleSubmit from './formUtils.js';
addLogout()

// handle login
const form = document.getElementById('edittask-form')
const title = document.getElementById("title")
const status = document.getElementById("status")
const due = document.getElementById("due")
const description = document.getElementById("description")
const submit = document.getElementById('submit-btn')

// fetch the task 
let task = {}
const id = new URLSearchParams(window.location.search).get("id")
submit.disabled = true
fetch('../server/Task/getTaskById', { id })
  .then(res => {
    if (res?.code === 0) {
      task = res?.data?.[0]
      title.value = task?.title
      status.value = task?.status
      due.value = task?.due
      description.value = task?.description
    } else {
      throw new Error(res?.message || "Failed to fetch the task. Please try again.");
    }
  }).catch(e => {
    console.error(e)
    notification(e.message, "error")
  }).finally(() => {
    submit.disabled = false
  })
// setup resetting the form
document.getElementById("reset-btn").addEventListener('click', () => {
  title.value = task?.title
  status.value = task?.status
  due.value = task?.due
  description.value = task?.description
})

// handle update
const fields = [
  [title, /\S/, "Please enter a task title."],
  [description, /\S/, "Please write the description of the task."],
]
const url = '../server/Task/updateTaskById'
const handleParams = function () {
  const formData = new FormData(form)
  formData.append('id', task.id)
  return formData
}
const handleData = () => notification("Congratulations! You have successfully updated the task!", "success").then(() => {
  window.location.href = "../pages/home.html"
})
const message = "Failed to update the task. Please try again."

handleSubmit(form, fields, submit, { url, handleParams, handleData, message })
