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
  IonToolbar, IonLabel, IonItem, IonToast, IonGrid, IonRow, IonCol, IonImg, IonFab, IonFabButton, IonIcon, IonActionSheet, createAnimation
} from '@ionic/react';
import { getLogger } from '../../core';
import { VisitContext } from '../VisitProvider';
import { RouteComponentProps } from 'react-router';
import { VisitProps } from '../props/VisitProps';
import { MyMap } from './MyMap';
import { Photo, usePhotoGallery } from '../../core/usePhotoGallery';
import { camera, close, trash } from 'ionicons/icons';

const log = getLogger('ItemEdit');

interface VisitEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const VisitEdit: React.FC<VisitEditProps> = ({ history, match }) => {
  const { visits, saving, savingError, saveVisit } = useContext(VisitContext);
  const [ numberError, setNumberError ] = useState<string | undefined>()
  const [ visit, setVisit ] = useState<VisitProps>();
  const [ placeName, setPlace ] = useState('')
  const [ noPersons1, setNoPersons ] = useState('')
  const [ latitude, setLatitude ] = useState(46.538666299999996);
  const [ longitude, setLongitude ] = useState(24.565142800000004);
  const { photos, takePhoto, deletePhoto } = usePhotoGallery();
  const [ photoToDelete, setPhotoToDelete ] = useState<Photo>();
  
  useEffect(simpleAnimation,[]);
  useEffect(groupAnimation,[]);

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const visit = visits?.find(it => it._id?.toString() === routeId);
    
    setVisit(visit);
    if (visit) {
      setPlace(visit.placeName)
      setNoPersons(visit.noPersons.toString())
      if (visit.latitude && visit.longitude) {
        setLatitude(visit.latitude);
        setLongitude(visit.longitude);
      }
    }
  }, [match.params.id, visits]);

  const handleSave = () => {
    
    const noPersons = parseInt(noPersons1)
    if (Number.isNaN(noPersons)) {
      setNumberError("The number of persons is not valid!")
    }
    else {
      const date = new Date().toISOString().slice(0, -1)
      const editedVisit = visit ? { ...visit, placeName, noPersons, latitude, longitude } : { placeName, noPersons, date, latitude, longitude };
      saveVisit && saveVisit(editedVisit, false).then(() => history.goBack());
    }
  };
  
  const setMapPosition = (e: any) => {
    setLatitude(e.latLng.lat());
    setLongitude(e.latLng.lng());
  }

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle className="title">Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
        <IonContent>
        <IonItem>
          <IonLabel className="place"><b>Place:</b> </IonLabel>
          <IonInput value={ placeName } onIonChange={e => setPlace(e.detail.value || '')} />
        </IonItem>
        <IonItem>
          <IonLabel className="pers"><b>NoPersons:</b> </IonLabel>
          <IonInput value={ noPersons1 } onIonChange={e => setNoPersons(e.detail.value || '')} />
        </IonItem>
        <IonItem>
          {latitude && longitude &&
            <MyMap 
              lat={latitude}
              lng={longitude}
              onMapClick={setMapPosition}
              onMarkerClick={log('onMarker: ' + latitude + " - " + longitude)}
            />}
        </IonItem>

        <IonItem>
          <IonGrid>
            <IonRow>
              {photos.map((photo, index) => (
                photo.placeId === visit?._id && 
                <IonCol className="img" size="4" key={index}>
                  <IonImg  onClick={() => setPhotoToDelete(photo)}
                          src={photo.webviewPath}/>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonItem>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => takePhoto(visit?._id)}>
            <IonIcon className="square-a" icon={camera}/>
          </IonFabButton>
        </IonFab>
        <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[{
            text: 'Delete',
            role: 'destructive',
            icon: trash,
            handler: () => {
              if (photoToDelete) {
                deletePhoto(photoToDelete);
                setPhotoToDelete(undefined);
              }
            }
          }, {
            text: 'Cancel',
            icon: close,
            role: 'cancel'
          }]}
          onDidDismiss={() => setPhotoToDelete(undefined)}
        />
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

  function groupAnimation() {
    const el1 = document.querySelector('.place');
    const el2 = document.querySelector('.pers');
    if (el1 && el2) {
      const animation1 = createAnimation()
          .addElement(el1)
          .direction('alternate')
          .iterations(9)
          .keyframes([
            {
              offset: 0, transform: 'skewX(-20deg)'
            },
            {
              offset: 0.5, transform: 'skewX(20deg)'
            },
            {
              offset: 1, transform: 'skewX(0)'
            },
          ])
          
      const animation2 = createAnimation()
        .addElement(el2)
        .direction('alternate')
        .iterations(9)
        .keyframes([
          {
            offset: 0, transform: 'skewX(20deg)'
          },
          {
            offset: 0.5, transform: 'skewX(-20deg)'
          },
          {
            offset: 1, transform: 'skewX(0)'
          },
        ])
      
      const parentAnimation = createAnimation()
        .duration(1000)
        .addAnimation([ animation1, animation2 ]);
      parentAnimation.play();
    }
  }


  function simpleAnimation() {
    const el = document.querySelector('.title');
    if (el) {
      const animation = createAnimation()
          .addElement(el)
          .duration(1000)
          .direction('alternate')
          .iterations(4)
          .keyframes([
            { 
              offset: 0, transform: 'scale(1)', opacity: '1' 
            },
            { 
              offset: 0.5, transform: 'scale(0.92)', opacity: '0.7' 
            },
            {
              offset: 1, transform: 'scale(0.85)', opacity: '0.3'
            }
          ]);
      animation.play();
    }
  }


};

export default VisitEdit;
