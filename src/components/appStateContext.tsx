'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppData, APPROVED_RIGHT, DELETE_RIGHT, FILTER_APPROVED, FILTER_PENDING, FILTER_REFUSED, photo, photoStatus, REFUSED_RIGHT, REVERT_RIGHT, userType, USERTYPE_ADMINISTRATOR, USERTYPE_CONTENT_EDITOR, USERTYPE_TEACHER } from '@/components/types';
import { CHECKAUTH, DRUPALURL, PatchPhoto, } from './engine';
import axios from 'axios';
import { Console } from 'console';


interface AppState {
    appData: AppData;
    GetFakeUser: ()=>void;
    GetFakeData: ()=>void;
    SendError:(m:string|null)=>void;
    GetDrupalUser: ()=>void;
    ToggleFilter: (type:string)=>void;
    TogglePhotoSelection: (photoId:string)=>void;
    HandleLoadingPhotos: (photos: photo[]) => void;
    HandleBatchAction: (status:photoStatus)=>void;
    UpdatePhoto: (photo:photo, newStatus:string)=>void;
  }

const GlobalStateContext = createContext<AppState | undefined>(undefined);
const initialAppData: AppData = {
    start:true,
    photosToValidate: [],
    rejectReasons: [
      { id: 0, label: "-- Select reason --" },
      { id: 1, label: "D’Foto ass aus dem Internet resp. vun engem Bildschierm opgeholl" },
      { id: 2, label: "Falsch Aart" },
      { id: 3, label: "Anere Grond" },
    ],
    userTypes: [
      {
        id:0, 
        label:USERTYPE_ADMINISTRATOR, 
        rights:[APPROVED_RIGHT, REFUSED_RIGHT, REVERT_RIGHT, DELETE_RIGHT]
      },
      {
        id:1, 
        label:USERTYPE_CONTENT_EDITOR, 
        rights:[APPROVED_RIGHT, REFUSED_RIGHT,REVERT_RIGHT]
      },
      {
        id:2, 
        label:USERTYPE_TEACHER, 
        rights:[APPROVED_RIGHT, REFUSED_RIGHT]
      },
      {
        id:3, 
        label:"other", 
        rights:[]
      }
    ],
    filter:{
      displayApproved: false,
      displayRefused: false,
      displayPending: true,
    },
    error:null
  };



  
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
    const [appData, setAppData] = useState<AppData>(initialAppData);
    const [timer,setTimer] = useState<NodeJS.Timeout | null>(null);
    
    //const GA4 = ReactGA4.initialize("G-KZ2ENR9329");

    const GetFakeUser = ()=>{
      setAppData((prevAppData) => ({
        ...prevAppData,
        user: {
          id: 1,
          name: "userName",
          roles: [USERTYPE_TEACHER],
          rights: [APPROVED_RIGHT, REFUSED_RIGHT,REVERT_RIGHT],
        },
      }));
    };

    const GetFakeData = ()=>{
      let photos: photo[] = [];
      let _photo: photo = {
        id: "",
        title: "",
        status: "pending_review",
        uid: "",
        studentIam: "BOUNI204",
        imageUrl: "/Bird.png",
        specie: "Test Specie",
        className: "distribution",
        message: "",
        school: "script",
        error: null,
        selected: false,
      };
      for(let i=1;i<=10;i++){
        let newPhoto = {..._photo};
        newPhoto.id = i.toString();
        photos.push(newPhoto);
      }
      setAppData((prevAppData) => ({
        ...prevAppData,
        photosToValidate: photos,
      }));
    };
    const SendError = async(m:string|null)=>{
      if(timer){
        clearTimeout(timer);
        setTimer(null);
      }

        setAppData((prevAppData) => ({
          ...prevAppData,
          error: m,
        }));
        console.log("Log error:",m);
        setTimer(setTimeout(() => {
            setAppData((prevAppData) => ({
              ...prevAppData,
              error: null,
            }));
          
        }, 4100));
    };

    const GetDrupalUser = ()=>{
      let userName = "";
      let roles:string[] = [];
      const config = {
        headers: {
        },
        params:{
        }
      };
      axios.get(DRUPALURL+CHECKAUTH ,config
      ).then((res) => { 
          if(res.data.name.length>0){
              userName = res.data.name;
              roles = res.data.roles;
              
              // SET APPDATA USER
              let userType:Array<userType> = appData.userTypes.filter(ut=>roles.includes(ut.label));
              let rights:string[] = [];
              if(userType.length>0){
                  rights = userType.map(ut=>ut.rights).flat();
              };
              console.log("User is logged in:",userName,roles,rights);
              //update rights
              setAppData((prevAppData) => ({
                ...prevAppData,
                user: {
                  id: res.data.uid,
                  name: userName,
                  roles: roles,
                  rights: rights,
                },
              }));
              
              
              
          }else{
              //wait for login btn click
              SendError("Error No User Connected");
          }
          
      }).catch((error)=>{
          SendError("Error getting User");
          //wait for login btn
      }); 
      
    };

    

    const HandleLoadingPhotos = (photos: photo[]) => {


      setAppData((prevAppData) => ({
        ...prevAppData,
        photosToValidate: photos,
      }));
    };
    
    const ToggleFilter = (type:string)=>{
      setAppData((prevAppData) => {
        let newFilter = {...prevAppData.filter};
        switch (type) {
          case FILTER_APPROVED:
            newFilter.displayApproved = !newFilter.displayApproved;
            break;
          case FILTER_REFUSED:
            newFilter.displayRefused = !newFilter.displayRefused;
            break;
          case FILTER_PENDING:
            newFilter.displayPending = !newFilter.displayPending;
            break;
          default:
            break;
        }
        return {
          ...prevAppData,
          filter: newFilter,
        };
      });

    }

    const UpdatePhoto = (photo:photo, newStatus:string)=>{
    
      setAppData((prevAppData) => {
        let updatedPhotos = prevAppData.photosToValidate.map((_photo) => {
          if (_photo.id === photo.id) {
            return { ..._photo, status: newStatus, message: photo.message };
          }
          return _photo;
        });
        return {
          ...prevAppData,
          photosToValidate: updatedPhotos,
        };
    });
    }

    const TogglePhotoSelection = (photoId:string)=>{
      setAppData((prevAppData) => {
        let updatedPhotos = prevAppData.photosToValidate.map((_photo) => {
            if (_photo.id === photoId) {
              return { ..._photo, selected: !_photo.selected };
            }
            return _photo;
          });
        return {
          ...prevAppData,
          photosToValidate: updatedPhotos,
        };
      });
    }

    const HandleBatchAction = (status:photoStatus)=>{
      // SELECT ALL PHOTOS SELECTED
      let selectedPhotos = appData.photosToValidate.filter(photo=>photo.selected);
      // FOR EACH PHOTO SEND MODIFICATION WITH NEW STATUS
      console.log("Batch Action on photos:", selectedPhotos, status); 
      selectedPhotos.forEach(async photo=>{
        // CALL PATCH PHOTO
        let photoReturn = await PatchPhoto(photo,status,photo.message);
        if(photoReturn.error === null){
          photo.selected = false;
          UpdatePhoto(photo,status);
        }else{
          SendError(`Error updating photo ID ${photo.id} ${photoReturn.error}`);
        }
        
      });


    }



    return (
      <GlobalStateContext.Provider value={{ appData,GetFakeUser,GetFakeData,SendError,UpdatePhoto,ToggleFilter,TogglePhotoSelection, GetDrupalUser,HandleLoadingPhotos, HandleBatchAction}}>
        {children}
      </GlobalStateContext.Provider>
    );
  };
    
    

export const useGlobalState = () => {
    const context = useContext(GlobalStateContext);
    if (context === undefined) {
        throw new Error('useGlobalState must be used within a GlobalStateProvider');
    }
    return context;
};