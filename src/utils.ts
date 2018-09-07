
import {eventChannel, END, Channel} from 'redux-saga';

export function without<T> (items: T[], item: T) {
  const index = items.indexOf(item);
  if (index !== -1) {
    items = items.slice();
    items.splice(index, 1);
  }
  return items;
}

export async function jsonGet (path: string) : Promise<object> {
  const response = await fetch(
    `${process.env.MOUNT_PATH}${path}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
  if (response.status !== 200) {
    throw new Error("server error");
  }
  return await response.json();
}

export async function apiPost (path: string, input: object) : Promise<object> {
  const response = await fetch(
    `${process.env.MOUNT_PATH}${path}`,
    {
      method: 'POST',
      body: JSON.stringify(input),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  if (response.status !== 200) {
    throw new Error("server error");
  }
  return await response.json();
}

export function channelOfEventSource (path: string) : Channel<object> {
  const source = new EventSource(`${process.env.MOUNT_PATH}${path}`);
  return eventChannel(function (emitter) {
    source.onmessage = function (msg) {
      try {
        emitter(JSON.parse(msg.data));
      } catch (ex) {
        console.error('bad message', msg.data);
        emitter(END);
      }
    };
    source.onerror = function () {
      console.error('error from event source');
      emitter(END);
    };
    return function () {
      source.close();
    };
  });
}

/*
// import ndjsonStream from 'can-ndjson-stream';
export async function jsonStreamGet (path: string) : Promise<object[]> {
  const response = await fetch(
    `${process.env.MOUNT_PATH}${path}`,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
  if (response.status !== 200) {
    throw new Error("server error");
  }
  // return ndjsonStream(response.body);
  const lines = await response.text();
  return lines.split("\n").map(line => JSON.parse(line));
}
*/
