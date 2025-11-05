/**
 * Answer pannel to display if the answer is correct or not and additonnal informations
 */
import styles from "@/app/page.module.css";
import { useGlobalState } from "@/components/appStateContext";
import { useEffect } from "react";
import { FILTER_APPROVED, FILTER_PENDING, FILTER_REFUSED, REVERT_RIGHT, right } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faCircleXmark, faFileCircleCheck, faListCheck } from "@fortawesome/free-solid-svg-icons";


export default function Filter({  route}: { route?: string;}) {
  const { appData, ToggleFilter } = useGlobalState();
  const _rights:string[] = appData.user?.rights || [];


    // INIT
    useEffect(()=>{
        const abortController = new AbortController();
        console.log("Filter Mounted", appData.user);
        
        return () => {
            abortController.abort();
            
        }
    },[appData.user])

  return (
    <div>
        {
            _rights.includes(REVERT_RIGHT as right)?
            <div className={styles.filtersWrapper}>
                
                {appData.filter.displayPending?
                    <button className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_PENDING)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon  icon={faListCheck}/></button>
                    :
                    <button className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_PENDING)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon  icon={faListCheck}/></button>
                }
                {appData.filter.displayRefused?
                    <button className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_REFUSED)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon className={styles.red} icon={faCircleXmark}/></button>
                    :
                    <button className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_REFUSED)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon className={styles.red} icon={faCircleXmark}/></button>
                }
                {appData.filter.displayApproved?
                    <button className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_APPROVED)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon className={styles.green} icon={faCircleCheck}/></button>
                    :
                    <button className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_APPROVED)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon className={styles.green} icon={faCircleCheck}/></button>
                }
            </div>
            :null
        }
    </div>
  );
}