import { createAnimation, IonButton, IonButtons, IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonLoading, IonModal, IonPage, IonSearchbar, IonSelect, IonSelectOption, IonTitle, IonToast, IonToolbar } from "@ionic/react";
import { add, wifi } from "ionicons/icons";
import React, { useContext, useEffect, useState } from "react";
import { RouteComponentProps } from "react-router";
import { getLogger } from "../../core";
import { VisitContext } from "../VisitProvider";
import Visit from "../props/Visit";
import { Plugins } from "@capacitor/core";
import { useNetworkStatus } from "../../core/useNetworkStatus";
import './Style.css';


const log = getLogger('VisitList')

const VisitList: React.FC<RouteComponentProps> = ({ history }) => {
    
    const { Storage } = Plugins
    const { networkStatus } = useNetworkStatus()
    const { visits, fetching, fetchingError, 
        loadMore, noPersonsList, onSelection, 
        isSelected, 
        serverConnection, synchronized
    } = useContext(VisitContext)

    const [ searchVisitByPlace, setSearchVisitByPlace ] = useState<string>('');
    const [ showModal, setShowModal ] = useState(false);
    useEffect(chainAnimation, [])

    const handleLogout = () => {
        Storage.remove({ key:"lastUpdated" })
        Storage.remove({ key:"visits" })
        Storage.remove({ key:"user" })
        Storage.remove({ key:"noPersonsList" })
        // Storage.clear()
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

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');
    
        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
              { offset: 0, opacity: '0', transform: 'scale(0)' },
              { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);
    
        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }
    
    const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
    }

    

    log('render')
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>
                        Visit Tracer
                        <IonIcon className={"network-icon-" + networkStatus.connected} icon={wifi}></IonIcon>
                    </IonTitle>
                    <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                        <IonImg className="img" src="assets\images\info.jpg"/>
                        <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
                    </IonModal>
                    <IonButtons slot="end">
                        <IonButton expand="full" onClick={() => setShowModal(true)}>
                            Info
                        </IonButton>
                        <IonButton onClick={handleLogout}>
                            Logout
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message='Fetching Visits...'/>
                <IonToast
                    isOpen={!serverConnection ? true : false}
                    cssClass="my-toast"
                    message='There is no connection to the server! Work will be saved locally.'
                    duration={5000}
                />
                <IonToast
                    isOpen={synchronized ? true : false}
                    cssClass="my-toast"
                    message='Connection is ON. Work saved on server successfully.'
                    duration={5000}
                />
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
                    <IonList className="item">
                        { visits
                            .filter(visit => visit.placeName.indexOf(searchVisitByPlace) >= 0)   
                            .map(({ _id, placeName, noPersons, date, latitude, longitude }) => 
                        <Visit key={_id} 
                            _id={_id} 
                            placeName={placeName} 
                            noPersons={noPersons} 
                            date={date} 
                            latitude={latitude}
                            longitude={longitude}
                            onEdit={_id => history.push(`/visit/${_id}`)} 
                        /> )}
                        
                    </IonList>
                )}
                <IonInfiniteScroll threshold="1px"
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

    
  function chainAnimation() {
    const el1 = document.querySelector('.item');
    const el2 = document.querySelector('.item');
    if (el1 && el2) {
      const animation1 = createAnimation()
          .addElement(el1)
          .fill('none')
          .duration(2000)
          .iterations(1)
          .keyframes([
            { offset: 0, background: 'red' },
            { offset: 0.72, background: 'var(--background)' },
            { offset: 1, background: 'green' }
          ]);

      const animation2 = createAnimation()
          .addElement(el2)
          .fill('none')
          .duration(1000)
          .direction('alternate')
          .iterations(1)
          .keyframes([
            { offset: 0, transform: 'scale(0)', opacity: 1 },
            { offset: 0.5, transform: 'scale(1.1)', opacity: 0.3 },
            { offset: 1, transform: 'scale(1)', opacity: 1 }
          ]);

      (async () => {
        await animation2.play();
        await animation1.play();
      })();
    }
  }

}

export default VisitList
