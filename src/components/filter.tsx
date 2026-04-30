/**
 * Answer pannel to display if the answer is correct or not and additonnal informations
 */
import styles from "@/app/page.module.css";
import { useGlobalState } from "@/components/appStateContext";
import { useEffect } from "react";
import { FILTER_APPROVED, FILTER_PENDING, FILTER_REFUSED, REVERT_RIGHT, right } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faCircleXmark, faEraser, faFileCircleCheck, faFilter, faListCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import FilterInput from "./filterInput";


export default function Filter({  route}: { route?: string;}) {
  const { appData, ToggleFilter, ResetFilters,SendFilteredRequest,GetImageFromApi} = useGlobalState();
  const _rights:string[] = appData.user?.rights || [];
  const filterFilled = ()=>{
   
    const active = (
        (appData.filter.displayApproved === true) &&
        (appData.filter.displayRefused === true) &&
        (appData.filter.displayPending === true) &&
        (appData.filter.species === null || appData.filter.species === 0) &&
        (appData.filter.school === null || appData.filter.school === 0) &&
        (appData.filter.className === null || appData.filter.className === 0) &&
        (appData.filter.author === null || appData.filter.author === "")
    );
    return !active;
  }


    // INIT
    useEffect(()=>{
        const abortController = new AbortController();
        
        return () => {
            abortController.abort();
            
        }
    },[appData.user])

  return (
    <div>
        {
           // _rights.includes(REVERT_RIGHT as right)?
            <div className={styles.filtersWrapper}>
                
                {appData.filter.displayPending?
                    <button title="hide pending filter" className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_PENDING)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon  icon={faListCheck}/></button>
                    :
                    <button title="display pending filter" className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_PENDING)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon  icon={faListCheck}/></button>
                }
                {appData.filter.displayRefused?
                    <button title="hide refused filter" className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_REFUSED)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon className={styles.red} icon={faCircleXmark}/></button>
                    :
                    <button title="display refused filter" className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_REFUSED)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon className={styles.red} icon={faCircleXmark}/></button>
                }
                {appData.filter.displayApproved?
                    <button title="hide approved filter" className={styles.filterButtonActive} onClick={()=>ToggleFilter(FILTER_APPROVED)}><FontAwesomeIcon icon={faEye}/> <FontAwesomeIcon className={styles.green} icon={faCircleCheck}/></button>
                    :
                    <button title="display approved filter" className={styles.filterButtonInactive} onClick={()=>ToggleFilter(FILTER_APPROVED)}><FontAwesomeIcon icon={faEyeSlash}/> <FontAwesomeIcon className={styles.green} icon={faCircleCheck}/></button>
                }
                {
                    <FilterInput label="author" dataSources={null} selectedData={0}></FilterInput>
                }
                {
                    <FilterInput label="species" dataSources={appData.species} selectedData={appData.filter.species !== null && appData.filter.species >= 0?appData.filter.species : 0}></FilterInput>
                    
                }
                {
                    <FilterInput label="className" dataSources={appData.classNames} selectedData={appData.filter.className !== null && appData.filter.className >=0?appData.filter.className:0}></FilterInput>
                }
                {
                    <FilterInput label="school" dataSources={appData.schools} selectedData={appData.filter.school !== null && appData.filter.school >= 0?appData.filter.school : 0}></FilterInput>
                }
                {
                /*<button title="Filter Result" className={filterFilled()?
                    styles.filterButtonActive
                    : styles.filterButtonInactive
                    } onClick={()=>GetImageFromApi(0,false)}><FontAwesomeIcon icon={faFilter}/></button>
                 */
                }
                <button title="clear filters" className={filterFilled()?
                    styles.filterButtonActive
                    : styles.filterButtonInactive
                    } onClick={()=>ResetFilters()}><FontAwesomeIcon icon={faEraser}/></button>
            </div>
          //  :null
        }
    </div>
  );
}