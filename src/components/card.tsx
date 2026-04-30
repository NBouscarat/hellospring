/**
 * Answer pannel to display if the answer is correct or not and additonnal informations
 */
import styles from "@/app/page.module.css";
import { useGlobalState } from "./appStateContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBan, faCheck, faClockRotateLeft, faCompress, faExpand, faMagnifyingGlass, faStop } from '@fortawesome/free-solid-svg-icons';
import { useState } from "react";
import { photo, dataSource, STATUS_APPROVED, STATUS_PENDING_REVIEW, STATUS_REFUSED } from "./types";
import { GetRejectReasonByMessage, PatchPhoto } from "./engine";

export default function Card({ route,photo}: { route?: string;  photo:photo }) { 
  const { appData, UpdatePhoto,SendError, TogglePhotoSelection } = useGlobalState();
  const [expand, setExpand] = useState(false);
  const [rejectReason, setRejectReason] = useState(GetRejectReasonByMessage(photo.message || "",appData.rejectReasons));
  const [message, setMessage] = useState(photo.message || "");
  const specie:dataSource = appData.species.find(s=>s.id===photo.specie) ?? { id: 0, label: "Unknown"};
  const school:dataSource = appData.schools.find(s=>s.id===photo.school) ?? { id: 0, label: "Unknown"};
  const nameOfClass:dataSource = appData.classNames.find(s=>s.id===photo.className) ?? { id: 0, label: "Unknown"};

  const HandleMessage = (m:string)=>{
    let _photo = {...photo};
    _photo.message = m;
    UpdatePhoto(_photo,STATUS_PENDING_REVIEW);
    setMessage(m);
  }


  const HandleRejectCard = async ()=>{
    if (photo) {
      let _message = rejectReason === appData.rejectReasons.length-1? message : appData.rejectReasons.find(r=>r.id===rejectReason)?.label || "";
      let photoReturn = PatchPhoto(photo,STATUS_REFUSED,_message);
      if((await photoReturn).error === null){
        let _photo = photo;
        _photo.message = _message;
        UpdatePhoto(_photo,STATUS_REFUSED);
      }else{
        SendError((await photoReturn).error);
      }
      
    }
  }

  const HandleAcceptedCard = async ()=>{
    
    if (photo) {
      let photoReturn = PatchPhoto(photo,STATUS_APPROVED,"");
      if((await photoReturn).error === null){
        UpdatePhoto(photo,STATUS_APPROVED);
      }else{
        SendError((await photoReturn).error);
      }
    }
  }

  const HandleUnDoneCard = async ()=>{
    
    if (photo) {
      let photoReturn = PatchPhoto(photo,STATUS_PENDING_REVIEW);
      if((await photoReturn).error === null){
        UpdatePhoto(photo,STATUS_PENDING_REVIEW);
      }
    }
  }

  const HandleExpandCard = ()=>{
    setExpand(!expand);
  }

  const HandleRejectedReason = (id:number)=>{
    setRejectReason(id);
    if(id !== appData.rejectReasons.length-1){
      let m = appData.rejectReasons.find(r=>r.id===id)?.label || "";
      setMessage(m);
      let _photo = {...photo};
      _photo.message = m;
      UpdatePhoto(_photo,STATUS_PENDING_REVIEW);
    }else{
      setMessage("");
    }

    
    
  }

  const GetClass=()=>{
    let className = "";
    switch (photo?.status) {
      case "pending_review":
        className = `switch_pending ${styles.card} ${expand?styles.maximize : null} `
        break;
      case "refused":
        className = `switch_refused ${styles.cardReduced} ${expand?styles.maximize : null} ${styles.rejected} `
        break;
      case "approved":
        className = `switch_approved ${styles.cardReduced} ${expand?styles.maximize : null} ${styles.accepted} `
        break;
      default:
         className = `switch_other ${styles.card} ${expand?styles.maximize : null} `
        break;
    }
    return className;
  }





  return (
    <div key={photo.react_id} className={GetClass()}>
            <div className={styles.cardAuthor}><span>by {photo.studentIam}</span><span>{nameOfClass.label} ({school.label})</span></div>
            <div className={styles.cardHeader}>
              <div className={styles.cardSelectBox}></div>
              <h2 className={styles.cardtitle}><span>
              <input className={styles.batchValidation} type="checkbox" checked={photo.selected} onChange={()=>TogglePhotoSelection(photo.id)}/></span>
              <span>
              {}</span><span>{<span key={specie.id} className={message.toLowerCase().includes("aart") ?styles.cardTagError:styles.cardTag}>{specie.label}</span>
                
              }</span> 
              </h2>
            </div>
            <div className={styles.cardImgZone}>
            <img
              src={photo.imageUrl}
              alt=""
            />
              {message.toLowerCase().includes("foto")? 
              <div className={styles.rejectedPhoto}>
                <div>
                  <span>
                    <FontAwesomeIcon icon={faBan} className={styles.red} />
                  </span>
                </div>
              </div>
              :null}
              {photo.status !== STATUS_PENDING_REVIEW ?
                <div className={styles.cardActions}>
                  <div onClick={HandleUnDoneCard}>
                    <span className={styles.cardButton}>
                      <FontAwesomeIcon icon={faClockRotateLeft} />
                    </span>
                  </div>
                  <div onClick={HandleExpandCard}>
                    <span className={styles.cardButton}>
                      <FontAwesomeIcon icon={!expand ?faMagnifyingGlass : faCompress} />
                    </span>
                    
                  </div>
                </div> : 
                <div className={styles.cardActions}>
                  <div onClick={HandleAcceptedCard}>
                    <span className={styles.cardButton}>
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  </div>
                  <div onClick={HandleExpandCard}>
                    <span className={styles.cardButton}>
                      <FontAwesomeIcon icon={!expand ?faMagnifyingGlass : faCompress} />
                    </span>
                    
                  </div>
                  <div onClick={HandleRejectCard}>
                    <span className={styles.cardButtonReject}>
                      <FontAwesomeIcon icon={faBan} />
                    </span>
                  </div>
                </div>
              }
            </div>
       
            
              {photo.status === STATUS_PENDING_REVIEW ?
                <div className={styles.feedback}>
                  <select value={rejectReason}  onChange={e => HandleRejectedReason(parseInt(e.target.value))} className={styles.feedbackSelect} >
                    {appData.rejectReasons.map(reason=>{
                        return (
                          <option  key={reason.id} value={reason.id}>
                            {reason.label}
                          </option>
                        )
                      })  
                    }
                  </select>
                  <textarea className={`${styles.feedbackInput}
                    ${rejectReason != (appData.rejectReasons.length-1)? styles.hide:null}`
                    } placeholder="Add a comment..." value={message} onChange={e =>HandleMessage(e.target.value)}>
                  </textarea>
                </div>
              : 
                <div className={styles.feedback}>
                  <p>{message}</p>
                </div>
              }
              
            
    </div>
  );
}