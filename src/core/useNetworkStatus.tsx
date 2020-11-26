import { NetworkStatus, Plugins } from "@capacitor/core";
import { useEffect, useState } from "react";
import { getLogger } from ".";

const log = getLogger('UseNetwork')

const { Network } = Plugins

const initialState = {
    connected: false,
    connectionType: 'unknown'
}

export const useNetworkStatus = () => {
    const [ networkStatus, setNetworkStatus ] = useState(initialState)
    useEffect(getNetworkEffect, [])
    return { networkStatus }

    function getNetworkEffect() {
        const handler = Network.addListener('networkStatusChange', handleNetworkStatusChange)
        Network.getStatus().then(handleNetworkStatusChange)
        let canceled = false
        return () => {
            canceled = true
            handler.remove()
        }

        function handleNetworkStatusChange(status: NetworkStatus) {
            log('status change ', status)
            if (!canceled) {
                setNetworkStatus(status)
            }
        }
    }
}