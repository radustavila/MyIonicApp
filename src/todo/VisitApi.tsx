import axios from 'axios'
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { VisitProps } from './VisitProps'


const log = getLogger('visitApi')
const visitUrl = `http://${baseUrl}/api/visits`

export const getAllVisits: (token: string) => Promise<VisitProps[]> = token => {
    return withLogs(axios.get(visitUrl, authConfig(token)), 'getAllVisits')
}

export const getSomeVisits: (token: string, start: number, count: number) => Promise<VisitProps[]> = (token, start, count) => {
    return withLogs(axios.get(`${visitUrl}/get/${start}/${count}`, authConfig(token)), `getSomeVisits: ${start} - ${start + count}`)
}

export const createVisit: (token: string, visit: VisitProps) => Promise<VisitProps[]> = (token, visit) => {
    return withLogs(axios.post(visitUrl, visit, authConfig(token)), 'createVisit')
}

export const updateVisit: (token: string, visit: VisitProps) => Promise<VisitProps[]> = (token, visit) => {
    return withLogs(axios.put(`${visitUrl}/${visit._id}`, visit, authConfig(token)), 'updateVisit')
}


interface MessageData {
    type: string
    payload: VisitProps
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }))
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
