import React from 'react'
import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonDatetime, IonGrid, IonImg, IonItem, IonRow } from "@ionic/react";
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
}

export default Visit