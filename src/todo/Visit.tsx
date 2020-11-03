import React from 'react'
import { IonItem, IonLabel } from "@ionic/react";
import { VisitProps } from "./VisitProps";



interface VisitPropsExt extends VisitProps {
    onEdit: (_id?: string) => void
}

const Visit: React.FC<VisitPropsExt> = ({ _id, placeName, date, noPersons, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{placeName + " - NoPersons: " + noPersons + ", " + date}</IonLabel>
        </IonItem>
    )
}

export default Visit