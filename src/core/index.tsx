import { Plugins } from "@capacitor/core";

export const baseUrl = 'localhost:3000';

export const getLogger: (tag: string) => (...args: any) => void =
    tag => (...args) => console.log(tag, ...args);

const log = getLogger('api');
const { Storage } = Plugins

interface Header {
  [key: string]: string;
}

export interface ResponseProps<T> {
  data: T
  headers: Header
}

export function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      if (res.headers['last-modified']) {
        console.log(res.headers['last-modified'])
        const lastModified = res.headers['last-modified']
        Storage.set({
          key: 'lastUpdated',
          value: JSON.stringify(lastModified)
        })
      }
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}


export const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const authConfig = (token?: string, lastUpdated?: string) => ({
  headers: {
    'Content-Type': 'application/json',
    'If-Modified-Since': lastUpdated,
    Authorization: `Bearer ${token}`,
  }
});
