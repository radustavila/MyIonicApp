import { IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonList, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from "@ionic/react"
import React, { useContext, useState } from "react"
import { RouteComponentProps } from "react-router"
import { AuthContext } from "../auth"
import { getLogger } from "../core"
import Visit from "./Visit"
import { getSomeVisits } from "./VisitApi"
import { VisitProps } from "./VisitProps"

const log = getLogger('Pieces List')



const VisitListPieces: React.FC<RouteComponentProps> = ({history}) => {
    const { token } = useContext(AuthContext);
    const [ visits, setVisits ] = useState<VisitProps[]>([]);
    const [ disableInfiniteScroll, setDisableInfiniteScroll ] = useState<boolean>(false)
    const [ start, setStart ] = useState<number>(0)
    const [ count, setCount ] = useState<number>(19)

    async function fetchData() {
        if (!token?.trim()) {
            return;
        }
        try {
            log('SOMEVisits started');
            const someVisits = await getSomeVisits(token, start, count);
            log('SEOMVisits succeeded');
            console.log(visits)
            if (someVisits && someVisits.length > 0) {
                setVisits([...visits, ...someVisits])
                console.log('After merging: ' + visits)
                setStart(start + count)
                setCount(5)
                console.log('start: ' + start + ' - count: ' + count)
                setDisableInfiniteScroll(visits.length < 5);
            } else {
                setDisableInfiniteScroll(true);
            }
            
        } catch (error) {
            log('SEOMVisits failed');
        }
      }
    
      useIonViewWillEnter(async () => {
        await fetchData();
      });
    
      async function searchNext($event: CustomEvent<void>) {
        await fetchData();
        ($event.target as HTMLIonInfiniteScrollElement).complete();
      }


    log('render')
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Go ahead and scroll to the infinite!</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonList>
                    { visits   
                        .map(({ _id, placeName, noPersons, date }) => 
                    <Visit key={_id} 
                        _id={_id} 
                        placeName={placeName} 
                        noPersons={noPersons} 
                        date={date} 
                        onEdit={_id => history.push(`/visit/${_id}`)} 
                    /> )}
                        
                </IonList>
                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent
                        loadingText="Loading more good visits...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    )
}

export default VisitListPieces