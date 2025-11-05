'use client'
import Image from "next/image";
import styles from "./page.module.css";
import Card from "@/components/card";
import { useGlobalState } from "@/components/appStateContext";
import { useEffect, useState } from "react";
import { DRUPALURL, PHOTOAPI } from "@/components/engine";
import { appRouterContext } from "next/dist/server/route-modules/app-route/shared-modules";
import { photo, STATUS_APPROVED, STATUS_PENDING_REVIEW, STATUS_REFUSED } from "@/components/types";
import axios from "axios";
import Filter from "@/components/filter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faCheck } from "@fortawesome/free-solid-svg-icons";
import { sendError } from "next/dist/server/api-utils";

export default function Home() {
  const { appData,GetFakeUser,GetFakeData,SendError,GetDrupalUser, HandleLoadingPhotos,HandleBatchAction} = useGlobalState();
  const [batchSelection, setBatchSelection] = useState(true);


  const GetImageFromApi = ()=> {
    const config = {
        headers: {
        },
        params:{
        }
    };

    axios.get(DRUPALURL+PHOTOAPI ,config).then((photoRes)=>{
        // declare array of photo
        var photosToValidate:photo[] = [];
        photoRes.data.forEach((jObject:any)=>{
            var _photo:photo = {
                id: jObject.nid_export,
                title: "",
                status: jObject.field_status,
                uid: jObject.field_author.id,
                studentIam: jObject.field_author.title,
                imageUrl: jObject.field_photo,
                specie: jObject.field_specie,
                message: jObject.field_message,
                className: jObject.field_classname,
                error: null,
                selected: false,
            }
            photosToValidate.push(_photo);
        });
        HandleLoadingPhotos(photosToValidate);
        

    }).catch((error)=>{
        console.log("Error getting Photos");
    });
  };

 

  // INIT
  useEffect(()=>{
    const abortController = new AbortController();
    GetDrupalUser();
    GetImageFromApi();

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
            <button onClick={()=>HandleBatchAction(STATUS_APPROVED)}><FontAwesomeIcon icon={faCheck}/> Approve Selected</button>
            <button onClick={()=>HandleBatchAction(STATUS_REFUSED)}><FontAwesomeIcon icon={faBan}/> Refuse Selected</button>
          </div>:null}
          <Filter></Filter>
        </div>
        <div className={styles.cardsWrapper}>
          {/* DISPLAY ONLY PHOTOS MATCHING FILTER */
          appData.photosToValidate.filter(
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
              return true;
            }
          ).map((photo)=>
          
            <Card key={photo.id} photo={photo}/>
          )}
          
        </div>
      </main>
      <footer className={styles.footer}>
        {appData.error !== null ? 
          <p className={styles.popUpError} onClick={()=>SendError(null)}>{appData.error}</p>
        :null}
      </footer>
    </div>
  );
}
