export default function makeTaskItem (task, handleEdit, handleDelete) {
  const taskModule = document.createElement("div")
  taskModule.classList.add("task-card")
  const taskContent = makeTaskContent(task)
  const taskButtons = makeTaskButtons(handleEdit, handleDelete)
  taskModule.append(taskContent)
  taskModule.append(taskButtons)
  return taskModule
}
function makeTaskContent (task) {
  const taskContent = document.createElement("div")
  taskContent.classList.add("task-content")
  for (let key in task) {
    if(key === 'id') continue
    const div = document.createElement("div")
    div.classList.add('task-itm')
    const span = document.createElement("span")
    span.classList.add("task-itm-title")
    span.innerText = key
    div.append(span)
    const text = document.createTextNode(task[key])
    div.append(text)
    taskContent.append(div)
  }
  return taskContent
}
function makeTaskButtons (handleEdit, handleDelete) {
  const tskBtns = document.createElement("div")
  tskBtns.classList.add("task-buttons")
  // edit button
  const editBtn = document.createElement("button")
  editBtn.classList.add("edit")
  editBtn.classList.add("icon-button")
  const editImg = document.createElement("div")
  editImg.classList.add("icon-img")
  editImg.style.backgroundImage = 'url("../assets/images/edit.png")'
  editBtn.append(editImg)
  editBtn.addEventListener('click', handleEdit)
  // remove button
  const deleteBtn = document.createElement("button")
  deleteBtn.classList.add("delete")
  deleteBtn.classList.add("icon-button")
  const deleteImg = document.createElement("idv")
  deleteImg.classList.add("icon-img")
  deleteImg.style.backgroundImage = 'url("../assets/images/remove.png")'
  deleteBtn.append(deleteImg)
  deleteBtn.addEventListener('click', handleDelete)
  tskBtns.append(editBtn)
  tskBtns.append(deleteBtn)
  return tskBtns
}