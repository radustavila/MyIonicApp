import { IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { add } from "ionicons/icons";
import React, { useContext } from "react";
import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { VisitContext } from "./VisitProvider";
import Visit from "./Visit";



const log = getLogger('VisitList')

const VisitList: React.FC<RouteComponentProps> = ({ history }) => {
    const { visits, fetching, fetchingError } = useContext(VisitContext)
    log('render')

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Visit Tracer</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message='Fetching Visits...'/>
                { visits && (
                    <IonList>
                        { visits.map(({ _id, placeName, noPersons, date }) => 
                        <Visit key={_id} 
                            _id={_id} 
                            placeName={placeName} 
                            noPersons={noPersons} 
                            date={date} 
                            onEdit={_id => history.push(`/visit/${_id}`)} 
                        /> )}
                    </IonList>
                )}
                { fetchingError && (
                    <div> { fetchingError.message || 'Failed to fetch Visits' } </div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/visit')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
}

export default VisitList
