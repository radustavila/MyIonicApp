import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { VisitProps } from './VisitProps';
import { createVisit, getListNoPersons, getVisits, newWebSocket, updateVisit } from './VisitApi';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';


const log = getLogger('ItemProvider');

type SaveVisitFn = (visit: VisitProps) => Promise<any>;
type GetVisitsFn = (visits: VisitProps[]) => Promise<any>;
type GetFilteredVisitsFn = (filter: number, isSelected: boolean) => void;

export interface VisitState {
  visits: VisitProps[]
  fetching: boolean
  fetchingError?: Error | null
  saving: boolean
  savingError?: Error | null
  saveVisit?: SaveVisitFn
  page: number
  totalPages: number
  loadMore?: GetVisitsFn,
  noPersonsList: number[],
  selection: number,
  isSelected: boolean
  onSelection?: GetFilteredVisitsFn,
  serverConnection: boolean
}

interface ActionProps {
  type: string
  payload?: any
}

const initialState: VisitState = {
  visits: [],
  fetching: false,
  saving: false,
  page: 1,
  totalPages: 1,
  noPersonsList: [],
  selection: 0,
  isSelected: false,
  serverConnection: true
};

const { Storage } = Plugins
const VISITS_COUNT = 8; // TO  MODIFY
const FETCH_VISITS_STARTED = 'FETCH_VISITS_STARTED';
const FETCH_VISITS_SUCCEEDED = 'FETCH_VISITS_SUCCEEDED';
const FETCH_VISITS_FAILED = 'FETCH_VISITS_FAILED';
const SAVE_VISIT_STARTED = 'SAVE_VISIT_STARTED';
const SAVE_VISIT_SUCCEEDED = 'SAVE_VISIT_SUCCEEDED';
const SAVE_VISIT_FAILED = 'SAVE_VISIT_FAILED';
const UPDATE_PAGE = 'UPDATE_PAGE';
const UPDATE_SELECTION = 'UPDATE_SELECTION';
const UPDATE_IS_SELECTED = 'UPDATE_IS_SELECTED';
const FETCH_LIST_NO_PERSONS = 'FETCH_LIST_NO_PERSONS';
const CLEAR_SELECTION_VISITS = 'CLEAR_SELECTION_VISITS';
const UPDATE_SERVER_CONNECTION = 'UPDATE_SERVER_CONNECTION'


const reducer: (state: VisitState, action: ActionProps) => VisitState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_VISITS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_VISITS_SUCCEEDED:
        if (payload.page && payload.totalPages !== -1) {
          const updatedVisits = [ ...state.visits, ...payload.visits ]
          Storage.set({
            key: 'visits',
            value: JSON.stringify(updatedVisits)
          })
          return { ...state, visits: updatedVisits, fetching: false, page: payload.page, totalPages: payload.totalPages };
        }
        return { ...state, visits: payload.visits, fetching: false, page: payload.page, totalPages: payload.totalPages };
      case FETCH_VISITS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_VISIT_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_VISIT_SUCCEEDED:
        const visits = [...(state.visits || [])];
        const visit = payload.visit;
        const index = visits.findIndex(it => it._id === visit._id);
        if (index === -1 && visit._id !== undefined) {
          visits.splice(visits.length, 0, visit);
        } else {
          visits[index] = visit;
        }
        return { ...state, visits: visits, saving: false };
      case SAVE_VISIT_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case UPDATE_PAGE:
        return { ...state, page: payload.page }
      case FETCH_LIST_NO_PERSONS:
        return { ...state, noPersonsList: payload.noPersonsList }
      case UPDATE_SELECTION:
        return { ...state, selection: payload.filter, isSelected: payload.isSelected }
      case CLEAR_SELECTION_VISITS:
        return { ...state, selection: payload.filter, visits: [] }
      case UPDATE_IS_SELECTED:
        if (payload.isSelected === true) {
          return { ...state, isSelected: false, selection: payload.filter, visits: [], page: 1 }
        }
        return { ...state, isSelected: false, filter: payload.filter }
      case UPDATE_SERVER_CONNECTION:
        return { ...state, serverConnection: payload.serverConnection }
      default:
        return state;
    }
  };

export const VisitContext = React.createContext<VisitState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const VisitProvider: React.FC<ItemProviderProps> = ({ children }) => {
  
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  
  const { visits, fetching, fetchingError,
    saving, savingError,
    page, totalPages, 
    noPersonsList, selection, isSelected,
    serverConnection 
  } = state;

  log(state)

  useEffect(getVisitsEffect, [token, page, selection]);
  useEffect(getListNoPersonsEffect, [token]);
  useEffect(wsEffect, [token]);

  const loadFilteredVisitsCallback = (filter: number, sel: boolean) => {
    if (filter !== 0) {
      dispatch({ type: UPDATE_SELECTION, payload: { filter, isSelected: true } })
    } else if (sel && filter === 0){
      dispatch({ type: UPDATE_IS_SELECTED, payload: { isSelected: sel, filter } })
    }
  }

  const saveVisit = useCallback<SaveVisitFn>(saveVisitCallback, [token]);
  const loadMore = useCallback<GetVisitsFn>(loadMoreVisitsCallback, [token, page, totalPages]);
  const onSelection = useCallback<GetFilteredVisitsFn>(loadFilteredVisitsCallback, [token])

  const value = {
    visits, fetching, fetchingError,
    saving, savingError, saveVisit,
    page, totalPages, loadMore,
    noPersonsList, selection, isSelected, onSelection, 
    
    serverConnection
  };

  log('returns');
  return (
    <VisitContext.Provider value={value}>
      {children}
    </VisitContext.Provider>
  );


  function getListNoPersonsEffect() {
    let canceled = false;
    fetchListNoPersons();
    return () => {
      canceled = true;
    }

    async function fetchListNoPersons() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetch list noPersons started')
        const noPersonsList = await getListNoPersons(token);
        log('fetch noPersons succeeded')
        if (!canceled) {
          dispatch({ type: FETCH_LIST_NO_PERSONS, payload: { noPersonsList } })
        }
      } catch (error) {
        log('fetch noPersonsList failed')
      }
    }
  }

  function getVisitsEffect() {
    let canceled = false;
    fetchVisits();
    return () => {
      canceled = true;
    }

    async function fetchVisits() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchVisits started');
        dispatch({ type: FETCH_VISITS_STARTED });
        const res = await getVisits(token, page, VISITS_COUNT, selection);
        log('fetchVisits succeeded');
        dispatch({ type: UPDATE_SERVER_CONNECTION, payload: { serverConnection: true } })
        if (!canceled) {
          dispatch({ type: FETCH_VISITS_SUCCEEDED, payload: { visits: res.visits, page, totalPages: res.totalPages } });    
        }
      } catch (error) {
        log('fetchVisits from server failed');
        if (error.message === 'Network Error') {
          dispatch({ type: UPDATE_SERVER_CONNECTION, payload:{ serverConnection: false} })
        }

        const res = await Storage.get({ key: 'visits' })
        if (res.value) {
          log('visits in local storage')
          const visits = JSON.parse(res.value)
          if (!canceled) {
            dispatch({ type: FETCH_VISITS_SUCCEEDED, payload: { visits } });
          }
        } else {
          dispatch({ type: FETCH_VISITS_FAILED, payload: { error } });
        }
      }
    }
  }

  async function saveVisitCallback(visit: VisitProps) {
    try {
      log('saveVisit started');
      dispatch({ type: SAVE_VISIT_STARTED });
      const savedVisit = await (visit._id ? updateVisit(token, visit) : createVisit(token, visit));
      log('saveVisit succeeded');
      dispatch({ type: SAVE_VISIT_SUCCEEDED, payload: { visit: savedVisit } });
    } catch (error) {
      log('saveVisit failed');
      dispatch({ type: SAVE_VISIT_FAILED, payload: { error } });
    }
  }

  async function loadMoreVisitsCallback() {
    log(`page - ${page} / ${totalPages}`)
    if (page < totalPages) {
      dispatch({ type: UPDATE_PAGE, payload: { page: page + 1 } });
    }
  }

  

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: visit } = message;
        log(`ws message, visit ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_VISIT_SUCCEEDED, payload: { visit } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
