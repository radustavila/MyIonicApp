import { Plugins } from "@capacitor/core";
import { useEffect } from "react";
import { getLogger } from ".";

const { BackgorundTask } = Plugins
const log = getLogger('UseBackgroundTask')


export const useBackgroundTask = (asyncTask: () => Promise<void>) => {
    useEffect(() => {
        let taskId = BackgorundTask.beforeExit(async () => {        
            log('useBackgroundTask - executeTask started');
            await asyncTask();
            log('useBackgroundTask - executeTask finished');
            BackgorundTask.finish({ taskId })
        })
    }, [])
    return {}
}