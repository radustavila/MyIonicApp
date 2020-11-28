import React from 'react'
import { IonItem, IonLabel } from "@ionic/react";
import { VisitProps } from "./VisitProps";
import './Styles.css'


interface VisitPropsExt extends VisitProps {
    onEdit: (_id?: string) => void
}

const Visit: React.FC<VisitPropsExt> = ({ _id, placeName, date, noPersons, onEdit }) => {
    return (
        <IonItem className="item" onClick={() => onEdit(_id?.toString())}>
            <IonLabel>{'NoPersons: ' + noPersons + ' - ' + date + ' - ' + placeName}</IonLabel>
        </IonItem>
    )
}

export default Visit