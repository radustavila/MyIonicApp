import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar, IonLabel, IonItem, IonToast
} from '@ionic/react';
import { getLogger } from '../core';
import { VisitContext } from './VisitProvider';
import { RouteComponentProps } from 'react-router';
import { VisitProps } from './VisitProps';

const log = getLogger('ItemEdit');

interface VisitEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const VisitEdit: React.FC<VisitEditProps> = ({ history, match }) => {
  const { visits, saving, savingError, saveVisit } = useContext(VisitContext);
  const [placeName, setPlace] = useState('')
  const [noPersons1, setNoPersons] = useState('')
  const [visit, setVisit] = useState<VisitProps>();
  const [ numberError, setNumberError ] = useState<string | undefined>()
  
  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const visit = visits?.find(it => it._id?.toString() === routeId);
    
    setVisit(visit);
    if (visit) {
      setPlace(visit.placeName)
      setNoPersons(visit.noPersons.toString())
    }
  }, [match.params.id, visits]);
  const handleSave = () => {
    
    const noPersons = parseInt(noPersons1)
    if (Number.isNaN(noPersons)) {
      setNumberError("The number of persons is not valid!")
    }
    else {
      const date = new Date().toISOString().slice(0, -1)
      const editedVisit = visit ? { ...visit, placeName, noPersons } : { placeName, noPersons, date };
      saveVisit && saveVisit(editedVisit, false).then(() => history.goBack());
    }
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
        <IonContent>
        <IonItem>
          <IonLabel>Place: </IonLabel>
          <IonInput value={ placeName } onIonChange={e => setPlace(e.detail.value || '')} />
        </IonItem>
        <IonItem>
          <IonLabel>NoPersons: </IonLabel>
          <IonInput value={ noPersons1 } onIonChange={e => setNoPersons(e.detail.value || '')} />
        </IonItem>
        <IonToast
          isOpen={numberError ? true : false}
          cssClass="my-toast"
          message={numberError}
          duration={5000}
        />
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save visit'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default VisitEdit;
