import { AppData, photo, rejectReason, STATUS_APPROVED, STATUS_REFUSED} from '@/components/types';
import axios from 'axios';

//DEFINE CONSTANTS
export const BACK_END_URL = "";
export const DRUPALURL = "https://hellospring.script.lu/";
export const CHECKAUTH = "jdrupal/connect";
export const PHOTOAPI = "react/photos?_format=json";
export const CLASSAPI = "jsonapi/node/class";
export const SPECIFICPHOTOAPI = "node/";
export const TOKEN = "/session/token";


export function GetAuthToken(){
    // get rest token
    var token = "";
    axios.get(DRUPALURL+TOKEN,{}
    ).then((res) => {
        token = res.data;
    }).catch((error)=>{
    });

    return token
}




export async function PatchPhoto(photo:photo, status:string, message?:string):Promise<photo>{
    let mState =null;
     switch (status) {
        case STATUS_APPROVED:
            mState = "published";
            break;
        case STATUS_REFUSED:
            mState = "rejected";
            break;
        default:
            mState = "draft";
            break;
    }
    const data = {
        type:"photo",
        field_status: {value:status},
        field_message: {value:message},
        moderation_state: {value:mState},
        revision_log: {value:message},
        
    };
    await axios.get(DRUPALURL+"session/token",{}
    ).then((resToken) => {
        axios.patch(DRUPALURL+SPECIFICPHOTOAPI+photo.id+"?_format=json",data,{
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-CSRF-Token": resToken.data,
            }
        }
        ).then((res) => { 
            photo.status=status;
            photo.error=null;
            return photo;
        }).catch((error)=>{
            console.log("Error validating Photo:",photo.id);
            photo.error=error;
            return photo;
        });
    }).catch((error)=>{
        console.log("GET TOKEN ERROR",error);
        photo.error="TOKEN: "+error;
        return photo;
    });
    return photo;
}

export function GetRejectReasonByMessage(message:string, reasons:rejectReason[]):number{
    let reasonId = 0;
    if(message && message.length>0){
        const reason = reasons.find(r=>r.label===message);
        if(reason){
            reasonId = reason.id;
        }else{
            reasonId = reasons.length; // custom reason
        }
    }
    return reasonId;
}


