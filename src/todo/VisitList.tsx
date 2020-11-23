import { IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonLoading, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToolbar } from "@ionic/react";
import { add } from "ionicons/icons";
import React, { useContext, useState } from "react";
import { RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { VisitContext } from "./VisitProvider";
import Visit from "./Visit";
import { Plugins } from "@capacitor/core";
import './Styles.css'


const log = getLogger('VisitList')

const VisitList: React.FC<RouteComponentProps> = ({ history }) => {
    
    const { Storage } = Plugins
    const { visits, fetching, fetchingError, loadMore, noPersonsList, onSelection, isSelected } = useContext(VisitContext)
    const [ searchVisitByPlace, setSearchVisitByPlace ] = useState<string>('');
    
    const handleLogout = () => {
        Storage.remove({ key: 'user' })
        Storage.remove({ key: 'visits'})
        log("LOGOUT")
        window.location.reload()
    }

    const handleClearFilter = () => {
        onSelection && onSelection(0, isSelected)
    }

    const onSelectChange = (event: any) => {
        onSelection && onSelection(event.detail.value, isSelected)
    }

    async function searchNext($event: CustomEvent<void>) {
        loadMore && loadMore(visits);
        ($event.target as HTMLIonInfiniteScrollElement).complete();
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
                <IonSelect 
                    interface='popover'
                    selectedText="Filter By Number of Persons"
                    onIonChange={onSelectChange}>
                    {noPersonsList.map(noPersons => <IonSelectOption key={noPersons} value={noPersons}>{noPersons}</IonSelectOption>)}
                </IonSelect>
                <IonButton
                    className="clearBtn"
                    disabled={isSelected ? false : true}
                    onClick={handleClearFilter}>
                    Clear Filter
                </IonButton>

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
                <IonInfiniteScroll threshold="100px"
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more visits...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
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
