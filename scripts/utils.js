export function notification(message, type="info") {
  const emoji = {
    'success': '✅ ',
    'error': '❌ ',
    'info': '❕ '
  }
  const notification = document.createElement('div')
  notification.classList.add('notification')
  notification.classList.add(type)
  notification.innerText = emoji[type] + message
  document.body.appendChild(notification)
  notification.offsetHeight
  notification.classList.add('show')
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
        resolve();
      }, 500)
    }, 2000)
  })
}

export function addLogout(){
  const navBar = document.getElementById("nav-bar")
  if(navBar){
    const logout = document.createElement("a")
    logout.innerText = "Log out"
    logout.addEventListener('click', ()=>{
      if(window.confirm("Are you sure to logout?")){
        localStorage.clear()
        window.location.href = "../pages/login.html"
      }
    })
    navBar.append(logout)
  }
}