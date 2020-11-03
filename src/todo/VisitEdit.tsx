import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { VisitContext } from "./VisistProvider";
import { VisitProps } from "./VisitProps";

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';



const log = getLogger('VisitEdit')

interface VisitEditProps extends RouteComponentProps<{
    id?:string
}> {}

const VisitEdit: React.FC<VisitEditProps> = ({ history, match }) => {
    const { visits, saving, savingError, saveVisit } = useContext(VisitContext)
    const [placeName, setPlace] = useState('')
    const [noPersons1, setNoPersons] = useState('')
    const [visit, setVisit] = useState<VisitProps>()
    useEffect(() => {
        log('useEffect')
        const routeID = match.params.id || ''
        log(routeID)
        const visit = visits?.find(v => v._id === routeID)
        log(visit?._id)
        
        setVisit(visit)
        if (visit) {
            setPlace(visit.placeName)
            setNoPersons(visit.noPersons.toString())
        }
    }, [match.params.id, visits])
    const handleSave = () => {
        const noPersons = parseInt(noPersons1)
        const editedVisit = visit ? { ...visit, placeName, noPersons } : { placeName, noPersons }
        saveVisit && saveVisit(editedVisit).then(() => history.goBack())
    }
    log('render')
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Edit Visit
                    </IonTitle>
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
                <IonItem>
                {/* <Calendar/> */}
                </IonItem>
                <IonLoading isOpen={saving} />
                    {savingError && (
                    <div>{savingError.message || 'Failed to save visit'}</div>
                    )}
            </IonContent>
        </IonPage>
    )
}

export default VisitEdit