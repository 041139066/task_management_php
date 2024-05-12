import { notification } from './utils.js';

export default async (url = '', params = {}, options = {}, isDownload = false) => {
  const token = localStorage.getItem('token');
  if (token) options['headers'] = {
    'Authorization': `Bearer ${token}`,
    ...options.headers
  }
  options.method = options.method?.toLowerCase() || 'get'
  switch (options.method) {
    case 'get':
      const queryString = new URLSearchParams(params).toString()
      const urls = url.split('?')
      url = urls.shift() + "?" + urls.join('?') + queryString
      break
    case 'form-url-encoded':
      options.method = 'post'
      options['headers']['Content-Type'] = 'application/x-www-form-urlencoded'
      options['body'] = new URLSearchParams(params).toString()
      break
    case 'form-data':
      options.method = 'post'
      if (params instanceof FormData) {
        options['body'] = params
      } else {
        const formData = new FormData()
        Object.entries(params).forEach(([key, itm]) => {
          Array.isArray(itm) ? itm.forEach(val => formData.append(key, val)) : formData.append(key, itm)
        })
        options['body'] = formData
      }
      break
    case 'post':
    case 'put':
    case 'delete':
      options['headers']['Content-Type'] = 'application/json'
      options['body'] = JSON.stringify(params)
      break
    default:
      throw new Error("Unsupported Method!")
  }
  return fetch(
    url,
    {
      'Accept': '*',
      'signal': AbortSignal.timeout(5000),
      ...options
    }).then(async response => {
      if (response.ok) {
        return isDownload ? response.blob() : response.json()
      } else {
        switch (response.status) {
          case 401:
            localStorage.clear()
            const message = await response.text()
            return notification(message, "error").then(() => {
              window.location.assign("/assignment02/pages/login.html")
            })
        }
      }
    })
}