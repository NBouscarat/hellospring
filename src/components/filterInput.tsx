/**
 * Answer pannel to display if the answer is correct or not and additonnal informations
 */
import styles from "@/app/page.module.css";
import { useGlobalState } from "@/components/appStateContext";
import { useEffect, useState } from "react";
import { FILTER_APPROVED, FILTER_PENDING, FILTER_REFUSED, REVERT_RIGHT, right, dataSource } from "./types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { faCircleXmark, faFileCircleCheck, faListCheck } from "@fortawesome/free-solid-svg-icons";


export default function FilterInput({label, dataSources, selectedData}:{label:string, dataSources:dataSource[]|null, selectedData:number}) {
  const { appData,SelectFilterDataSource,UpdateFilter} = useGlobalState();
  const [filterValue, setValue] = useState("");
  const filteredDatas = dataSources?.filter((data: dataSource) =>
    data.label.toLowerCase().includes(filterValue.toLowerCase())
  ).slice(0, 5); // Limit to first 10 results

  const SelectDataSource = (id:number)=>{
    // TO DO: add selected data source to filter in app state
    SelectFilterDataSource(id, label);
  }

  const HandleSelectValue = (value:string)=>{
    console.log("HandleSelectValue called with value:",value,dataSources);
    if(dataSources === null){
        UpdateFilter(value,label);
        setValue(value);
    }else{
        setValue(value);
    }
    
  }
    // INIT
    useEffect(()=>{
        const abortController = new AbortController();
        
        return () => {
            abortController.abort();
            
        }
    },[appData.user])

  return (
    <div className={styles.autoComplete}>
        {selectedData !== 0?
        <div className={styles.selectedDataSource} onClick={()=>SelectDataSource(0)}>
            {dataSources?.find(ds=>ds.id===selectedData)?.label} <FontAwesomeIcon icon={faCircleXmark}/>
        </div>
        :
        <>
        <input
        type="text"
        placeholder={`Filter ${label}...`}
        value={filterValue}
        onChange={(e) => HandleSelectValue(e.target.value)}
        />
        {dataSources !== null?
        <ul>
            {filteredDatas?.map((ds: dataSource) => (
            <li key={ds.id} onClick={()=>SelectDataSource(ds.id)}>
                {ds.label}
            </li>
            ))}
        </ul>:null
        }
        
        </>
        }
    </div>
  );
}