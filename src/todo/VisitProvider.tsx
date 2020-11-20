import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { VisitProps } from './VisitProps';
import { createVisit, getAllVisits, newWebSocket, updateVisit } from './VisitApi';
import { AuthContext } from '../auth';
import { Plugins } from '@capacitor/core';

const log = getLogger('ItemProvider');

type SaveVisitFn = (visit: VisitProps) => Promise<any>;
type SaveVisitsFn = (visits: VisitProps[]) => Promise<any>;

export interface VisitState {
  visits?: VisitProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveVisit?: SaveVisitFn,
  setVisits?: SaveVisitsFn
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: VisitState = {
  fetching: false,
  saving: false,
};

const FETCH_VISITS_STARTED = 'FETCH_VISITS_STARTED';
const FETCH_VISITS_SUCCEEDED = 'FETCH_VISITS_SUCCEEDED';
const FETCH_VISITS_FAILED = 'FETCH_VISITS_FAILED';
const SAVE_VISIT_STARTED = 'SAVE_VISIT_STARTED';
const SAVE_VISIT_SUCCEEDED = 'SAVE_VISIT_SUCCEEDED';
const SAVE_VISIT_FAILED = 'SAVE_VISIT_FAILED';

const reducer: (state: VisitState, action: ActionProps) => VisitState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_VISITS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_VISITS_SUCCEEDED:
        return { ...state, visits: payload.visits, fetching: false };
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
      default:
        return state;
    }
  };

export const VisitContext = React.createContext<VisitState>(initialState);

interface ItemProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const VisitProvider: React.FC<ItemProviderProps> = ({ children }) => {
  const { Storage } = Plugins
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(reducer, initialState);
  const { visits, fetching, fetchingError, saving, savingError } = state;
  //const [items, setItems] = useState<string[]>([]);
  useEffect(getVisitsEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveVisit = useCallback<SaveVisitFn>(saveVisitCallback, [token]);
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
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchVisits started');
        dispatch({ type: FETCH_VISITS_STARTED });
        const visits = await getAllVisits(token);
        log('fetchVisits succeeded');

        await Storage.set({
          key: 'visits',
          value: JSON.stringify(visits)
        })
        

        if (!canceled) {
          dispatch({ type: FETCH_VISITS_SUCCEEDED, payload: { visits } });
        }
      } catch (error) {
        log('fetchVisits from server failed');
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
