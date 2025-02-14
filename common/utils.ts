import fetch from 'node-fetch';

export const defaultQueueName = "message"

export type SimpleMap<V = string> = {
  [index: string]: V
}

export enum MsgType {
  Register = "register",
  Unregister = "unregister",
  Normal = "normal"
}

export type Message = {
  type: MsgType,
  from: string,
  to: string,
  payload: string,
}

export enum HTTPMethods {
  Post = "POST",
  Get = "GET",
  Delete = "DELETE"
}

export const apiCall = async (url: string, method: HTTPMethods = HTTPMethods.Get, body?: Object) => {
  let response
  if (body) {
    // console.log("body", body)
    response = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
  } else {
    response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const data = await response.json();
  return data
}

export const isValidUrl = (url: string) => {
  try {
    return new URL(url)
  }
  catch (err) {
    throw new Error(`${url} is not a valid url`)
  }
}
