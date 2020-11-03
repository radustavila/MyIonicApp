import React, { useCallback, useEffect, useReducer } from 'react'
import PropTypes from 'prop-types'
import { getLogger } from '../core'
import { VisitProps } from './VisitProps'
import { createVisit, getAllVisits, newWebSocket, updateVisit } from './VisitApi'


const log = getLogger('VisitProvider')

type SaveVisitFn = (visit: VisitProps) => Promise<any>

export interface VisitState {
    visits?: VisitProps[]
    fetching: boolean
    fetchingError?: Error | null
    saving: boolean
    savingError?: Error | null
    saveVisit?: SaveVisitFn
}

interface ActionProps {
    type: string
    payload?: any
}

const initialState: VisitState = {
    fetching: false,
    saving: false
}

const FETCH_VISITS_STARTED = 'FETCH_VISITS_STARTED';
const FETCH_VISITS_SUCCEEDED = 'FETCH_VISITS_SUCCEEDED';
const FETCH_VISITS_FAILED = 'FETCH_VISITS_FAILED';
const SAVE_VISIT_STARTED = 'SAVE_VISIT_STARTED';
const SAVE_VISIT_SUCCEEDED = 'SAVE_VISIT_SUCCEEDED';
const SAVE_VISIT_FAILED = 'SAVE_VISIT_FAILED';


const reducer: (state: VisitState, action: ActionProps) => VisitState = (state, { type, payload }) => {
    switch(type) {
        case FETCH_VISITS_STARTED:
            return { ...state, fetching: true, fetchingError: null }
        case FETCH_VISITS_SUCCEEDED:
            return { ...state, visits: payload.visits, fetching: false}
        case FETCH_VISITS_FAILED:
            return { ...state, fetchingError: payload.error, fetching: false }
        case SAVE_VISIT_STARTED:
            return { ...state, saving: true, savingError: null}
        case SAVE_VISIT_SUCCEEDED:
            const visits = [...(state.visits || [])]
            const visit = payload.visit
            const index = visits.findIndex(v => v._id === visit._id)
            if (index === -1) {
                visits.splice(visits.length, 0, visit)
            } else {
                visits[index] = visit
            }
            return { ...state, visits, saving: false }
        case SAVE_VISIT_FAILED:
            return { ...state, savingError: payload.error, saving: false }
        default:
            return state
    }
}


export const VisitContext = React.createContext<VisitState>(initialState)

interface VisitProviderProps {
    children: PropTypes.ReactNodeLike
}


export const VisitProvider: React.FC<VisitProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { visits, fetching, fetchingError, saving, savingError } = state;
    useEffect(getVisitsEffect, []);
    useEffect(wsEffect, []);
    const saveVisit = useCallback<SaveVisitFn>(saveVisitCallback, []);
    const value = { visits, fetching, fetchingError, saving, savingError, saveVisit };
    log('returns');
    return (
      <VisitContext.Provider value={value}>
        {children}
      </VisitContext.Provider>
    );
  
    function getVisitsEffect() {
      let canceled = false;
      fetchVisits();
      return () => {
        canceled = true;
      }
  
      async function fetchVisits() {
        try {
          log('fetchVisits started');
          dispatch({ type: FETCH_VISITS_STARTED });
          const visits = await getAllVisits();
          log('fetchVisits succeeded');
          if (!canceled) {
            dispatch({ type: FETCH_VISITS_SUCCEEDED, payload: { visits } });
          }
        } catch (error) {
          log('fetchVisits failed');
          dispatch({ type: FETCH_VISITS_FAILED, payload: { error } });
        }
      }
    }
  
    async function saveVisitCallback(visit: VisitProps) {
      try {
        log('saveVisit started');
        dispatch({ type: SAVE_VISIT_STARTED });
        const savedVisit = await (visit._id ? updateVisit(visit) : createVisit(visit));
        log('saveVisit succeeded');
        dispatch({ type: SAVE_VISIT_STARTED, payload: { visit: savedVisit } });
      } catch (error) {
        log('saveVisit failed');
        dispatch({ type: SAVE_VISIT_FAILED, payload: { error } });
      }
    }
  
    function wsEffect() {
      let canceled = false;
      log('wsEffect - connecting');
      const closeWebSocket = newWebSocket(message => {
        if (canceled) {
          return;
        }
        const { event, payload: { visit }} = message;
        log(`ws message, visit ${event}`);
        if (event === 'created' || event === 'updated') {
          dispatch({ type: SAVE_VISIT_SUCCEEDED, payload: { visit } });
        }
      });
      return () => {
        log('wsEffect - disconnecting');
        canceled = true;
        closeWebSocket();
      }
    }
  };
  