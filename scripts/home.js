import { notification, addLogout } from './utils.js';
import makeTaskItem from './listUtils.js';
import fetch from './fetch.js'
addLogout()

const form = document.getElementById("search-bar")
const keywords = document.getElementById("keywords")
const status = document.createElement('select')
const order = document.createElement('select')

const searchButton = document.getElementById("search-btn")
const loadButton = document.getElementById('load-btn')
const resetButton = document.getElementById('reset-btn')
const taskContainer = document.getElementById("task-container")

// status select
const statusList = {
  '0': "All",
  '1': "In Progress",
  '2': "Completed",
  '3': "Cancelled",
  '4': 'Over Due'
}
for (let key in statusList) {
  const option = document.createElement("option")
  option.value = key
  option.label = statusList[key]
  status.append(option)
}
keywords.after(status)
// sorting select
const orderList = {
  'created DESC': "Created Time \u2193", // descending
  'created ASC': "Created Time \u2191", // ascending
  'title DESC': "Title \u2193", // descending
  'title ASC': "Title \u2191",  // ascending
  'due DESC': "Due Date and Time \u2193", // descending
  'due ASC': "Due Date and Time \u2191", // ascending
}
for (let key in orderList) {
  const option = document.createElement("option")
  option.value = key
  option.label = orderList[key]
  order.append(option)
}
status.after(order)

let tasks = [] // the task array

function fetchTasks (reset = true) {
  if (reset) {
    tasks = []
    taskContainer.innerHTML = ''
  }
  const [orderBy, direction] = order.value.split(" ")
  const params = {
    keywords: keywords.value.trim(),
    status: status.value,
    order: orderBy,
    direction,
    offset: tasks.length,
    limit: 10
  }
  searchButton.disabled = true
  loadButton.disabled = true
  resetButton.disabled = true
  fetch('../server/Task/getTasks', params)
    .then(res => {
      if (res?.code === 0) {
        const { total, records = [] } = res?.data || {}
        tasks.push(...records)
        records.forEach(itm => {
          const task = {
            "id": itm.id,
            "Title: ": itm.title,
            "Status: ": itm.status === "1" && itm.due && new Date() > new Date(itm.due) ? "Over Due" : statusList[itm.status],
            "Due date and time: ": itm.due || 'N/A',
            "Description: ": itm.description
          }
          const handleEdit = () => { window.location.href = `../pages/editTask.html?id=${itm.id}` }
          const handleDelete = () => {
            if (window.confirm("Are you sure to delete this task?")) {
              fetch('../server/Task/deleteTaskById', { id: itm.id })
                .then(res => {
                  if (res?.code === 0) {
                    notification("Success! The task has been deleted.", 'success')
                    fetchTasks()
                  } else {
                    throw new Error(res?.message || "Failed to delete the tasks. Please try again.");
                  }
                }).catch(e => {
                  console.error(e)
                  notification(e.message, "error")
                })
            }
          }
          taskContainer.append(makeTaskItem(task, handleEdit, handleDelete))
        })
        loadButton.style.display = total > tasks.length ? 'block' : 'none'
      } else {
        throw new Error(res?.message || "Failed to load the tasks. Please try again.");
      }
    }).catch(e => {
      console.error(e)
      notification(e.message, "error")
    }).finally(() => {
      searchButton.disabled = false
      loadButton.disabled = false
      resetButton.disabled = false
    })
}
form.addEventListener('submit', function (e) {
  e.preventDefault()
  fetchTasks()
})
form.addEventListener('reset', function (e) {
  setTimeout(() => {
    fetchTasks()
  }, 0)
})
loadButton.addEventListener('click', function (e) {
  fetchTasks(false)
})

// initial fetching tasks
fetchTasks()







