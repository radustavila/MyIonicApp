import React from 'react'
import { createAnimation, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonDatetime, IonGrid, IonImg, IonItem, IonRow } from "@ionic/react";
import { VisitProps } from "./VisitProps";
import './Styles.css'
import { usePhotoGallery } from '../../core/usePhotoGallery';


interface VisitPropsExt extends VisitProps {
    onEdit: (_id?: string) => void
}

const Visit: React.FC<VisitPropsExt> = ({ _id, placeName, date, noPersons, latitude, longitude, onEdit }) => {
    const { photos } = usePhotoGallery();

    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonCard className="item">
                <IonCardHeader>
                    <IonCardTitle>{placeName + ' - ' + noPersons + ' persoane'}</IonCardTitle>
                    <IonDatetime value={date} display-timezone="utc" readonly={true} displayFormat="YYYY MMM DD, HH:mm"></IonDatetime>
                </IonCardHeader>
                <IonCardContent>
                    <IonGrid>
                        <IonRow>
                            {photos.map((photo, index) => (
                                photo.placeId === _id && 
                                <IonCol size="4" key={index}>
                                <IonImg  src={photo.webviewPath} alt="No Image"/>
                                </IonCol>
                            ))}
                        </IonRow>
                    </IonGrid>
                </IonCardContent>
            </IonCard>
        </IonItem>
    )
    
  function chainAnimation() {
    const el1 = document.querySelector('.item');
    const el2 = document.querySelector('.item');
    if (el1 && el2) {
      const animation1 = createAnimation()
          .addElement(el1)
          .fill('none')
          .duration(2000)
          .iterations(3)
          .keyframes([
            { offset: 0, transform: 'scale(1) rotate(0)' },
            { offset: 0.3, transform: 'scale(1.2) rotate(15deg)' },
            { offset: 0.6, transform: 'scale(1.2) rotate(-15deg)' },
            { offset: 1, transform: 'scale(1) rotate(0) '}
          ]);

      const animation2 = createAnimation()
          .addElement(el2)
          .fill('none')
          .duration(1000)
          .direction('alternate')
          .iterations(5)
          .keyframes([
            { offset: 0, transform: 'scale(1)', opacity: 1 },
            { offset: 0.5, transform: 'scale(1.2)', opacity: 0.3 },
            { offset: 1, transform: 'scale(1)', opacity: 1 }
          ]);

      (async () => {
        await animation1.play();
        await animation2.play();
      })();
    }
  }
}

export default Visit