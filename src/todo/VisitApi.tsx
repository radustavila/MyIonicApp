import axios from 'axios'
import { getLogger } from '../core'
import { VisitProps } from './VisitProps'


const log = getLogger('visitApi')
const baseUrl = 'localhost:3000'
const visitUrl = `http://${baseUrl}/api/visits`

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
}

interface ResponseProps<T> {
    data: T
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`)
            return Promise.resolve(res.data)
        })
        .catch(e => {
            log(`${fnName} - failed`)
            return Promise.reject(e)
        })
}

export const getAllVisits: () => Promise<VisitProps[]> = () => {
    return withLogs(axios.get(visitUrl, config), 'getAllVisits')
}

export const createVisit: (visit: VisitProps) => Promise<VisitProps> = visit => {
    return withLogs(axios.post(visitUrl, visit, config), 'createVisit')
}

export const updateVisit: (visit: VisitProps) => Promise<VisitProps> = visit => {
    return withLogs(axios.put(`${visitUrl}/${visit._id}`, visit, config), 'updateVisit')
}


interface MessageData {
    event: string
    payload: {
        visit: VisitProps
    }
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
    }
    ws.onclose = () => {
        log('web socket onclose');
    }
    ws.onerror = e => {
        log('web socket onerror', e);
    }
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data))
    }
    return () => {
        ws.close()
    }
}
