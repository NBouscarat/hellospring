'use client'
import styles from "./page.module.css";
import Card from "@/components/card";
import { useGlobalState } from "@/components/appStateContext";
import { useEffect, useState } from "react";
import { DRUPALURL, PHOTOAPI, MODERATIONAPI } from "@/components/engine";
import { photo, STATUS_APPROVED, STATUS_PENDING_REVIEW, STATUS_REFUSED } from "@/components/types";
import axios from "axios";
import Filter from "@/components/filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const { appData,GetFakeUser,GetFakeData,SendError,GetDrupalUser,GetSpecies, GetImageFromApi, HandleLoadingPhotos,HandleBatchAction, GetNextPage} = useGlobalState();
  const [batchSelection, setBatchSelection] = useState(true);
  const searchParams = useSearchParams();
  const displayPhotos = appData.photosToValidate.filter(
    (photo)=>{
      if(!appData.filter.displayRefused && photo.status===STATUS_REFUSED){
        return false;
      }
      if(!appData.filter.displayApproved && photo.status===STATUS_APPROVED){
        return false;
      }
      if(!appData.filter.displayPending && photo.status===STATUS_PENDING_REVIEW){
        return false;
      }
      if(appData.filter.species !== null && appData.filter.species !== 0){
        if(photo.specie !== appData.filter.species){
          return false;
        }
      }
      if(appData.filter.author !== null && appData.filter.author !== ""){
        if(photo.studentIam.toLowerCase().includes(appData.filter.author.toLowerCase()) === false){
          return false;
        }
      }
      if(appData.filter.className !== null && appData.filter.className !== 0){
        if(photo.className !== appData.filter.className){
          return false;
        }
      }
      if(appData.filter.school !== null && appData.filter.school !== 0){
        if(photo.school !== appData.filter.school){
          return false;
        }
      }
      return true;
    }
  );

  

  const NextPage = ()=>{

  }



  // INIT
  useEffect(()=>{
    const abortController = new AbortController();
    GetDrupalUser();
    GetImageFromApi(0,false);
    

    //GetFakeUser();
    //GetFakeData();
    
    return () => {
        abortController.abort();
        
    }
},[])

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.filters}>
          {batchSelection?
          <div className={styles.batchActions}>
            <span className={styles.info}>{appData.photosToValidate.filter((p)=>{return p.selected}).length}/{displayPhotos.length} photos</span>
            <button onClick={()=>HandleBatchAction(STATUS_APPROVED)}><FontAwesomeIcon icon={faCheck}/> Approve Selected</button>
            <button onClick={()=>HandleBatchAction(STATUS_REFUSED)}><FontAwesomeIcon icon={faBan}/> Refuse Selected</button>
          </div>:null}
          <div>
            <Filter></Filter><span className={styles.info}>{displayPhotos.length}/{appData.photosToValidate.length} photos</span></div>
        </div>
        <div className={styles.cardsWrapper}>
          {/* DISPLAY ONLY PHOTOS MATCHING FILTER */
          displayPhotos.map((photo)=>
          
            <Card key={photo.react_id} photo={photo}/>
          )}
          
        </div>
        {appData.morePhotos?
          <div className={styles.morePhotos} onClick={()=>GetNextPage()}>
            <p>More data are available... Click here to load more</p>
          </div>:null
          }
        {appData.loading?
          <div className={styles.Loading}>
            <p>Loading data please wait...</p>
          </div>:null
          }
      </main>
      <footer className={styles.footer}>
        {appData.error !== null ? 
          <p className={styles.popUpError} onClick={()=>SendError(null)}>{appData.error}</p>
        :null}
      </footer>
    </div>
  );
}
