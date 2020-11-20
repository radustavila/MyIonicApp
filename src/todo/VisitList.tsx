import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonList, IonLoading, IonPage, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react";
import { add } from "ionicons/icons";
import React, { useContext, useState } from "react";
import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { VisitContext } from "./VisitProvider";
import Visit from "./Visit";
import { Plugins } from "@capacitor/core";


const log = getLogger('VisitList')

const VisitList: React.FC<RouteComponentProps> = ({ history }) => {

    const { visits, fetching, fetchingError } = useContext(VisitContext)
    const { Storage } = Plugins
    const [searchVisitByPlace, setSearchVisitByPlace] = useState<string>('');
    
    const handleLogout = () => {
        Storage.remove({ key: 'user' })
        Storage.remove({ key: 'visits'})
        log("LOGOUT")
        window.location.reload()
    }

    log('render')
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Visit Tracer</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleLogout}>
                            Logout
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message='Fetching Visits...'/>
                <IonSearchbar
                    value={searchVisitByPlace}
                    color="primary"
                    onIonChange={e => setSearchVisitByPlace(e.detail.value!)}>
                </IonSearchbar> 
                { visits && (
                    <IonList>
                        { visits
                            .filter(visit => visit.placeName.indexOf(searchVisitByPlace) >= 0)   
                            .map(({ _id, placeName, noPersons, date }) => 
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
