import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { VisitProvider } from './todo/VisitProvider';
import VisitList from './todo/VisitList';
import VisitEdit from './todo/VisitEdit';
import VisitListPieces from './todo/VisitListPieces';
import { AuthProvider, Login, PrivateRoute } from './auth';
import { ellipse, triangle } from 'ionicons/icons';

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
    <IonTabs>
      <IonRouterOutlet>
        <AuthProvider>
          <Route path="/login" component={Login} exact={true}/>
          <VisitProvider>
            <PrivateRoute path="/all-visits" component={VisitList} exact={true} />
            <PrivateRoute path="/visits" component={VisitListPieces} exact={true} />
            <PrivateRoute path="/visit" component={VisitEdit} exact={true} />
            <PrivateRoute path="/visit/:id" component={VisitEdit} exact={true} />
          </VisitProvider>
          <Route exact path="/" render={() => <Redirect to="/all-visits" />} />
        </AuthProvider>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
          <IonTabButton tab="tab1" href="/all-visits">
            <IonIcon icon={triangle} />
            <IonLabel>All Visits</IonLabel>
          </IonTabButton>
          <IonTabButton tab="tab2" href="/visits">
            <IonIcon icon={ellipse} />
            <IonLabel>Infinite Scroll</IonLabel>
          </IonTabButton>
          </IonTabBar>
      </IonTabs>
    </IonReactRouter>
  </IonApp>
);

export default App;
