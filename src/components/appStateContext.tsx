'use client'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppData, APPROVED_RIGHT, DELETE_RIGHT, FILTER_APPROVED, FILTER_PENDING, FILTER_REFUSED, photo,dataSource, photoStatus, REFUSED_RIGHT, REVERT_RIGHT, userType, USERTYPE_ADMINISTRATOR, USERTYPE_CONTENT_EDITOR, USERTYPE_TEACHER } from '@/components/types';
import { CHECKAUTH, DRUPALURL, PatchPhoto, PHOTOAPI, MODERATIONAPI} from './engine';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';


interface AppState {
    appData: AppData;
    GetFakeUser: ()=>void;
    GetFakeData: ()=>void;
    SendError:(m:string|null)=>void;
    GetDrupalUser: ()=>void;
    GetSpecies: ()=>void;
    GetSchools: ()=>void;
    ToggleFilter: (type:string)=>void;
    TogglePhotoSelection: (photoId:number)=>void;
    HandleLoadingPhotos: (photos: photo[]) => void;
    HandleBatchAction: (status:photoStatus)=>void;
    UpdatePhoto: (photo:photo, newStatus:string)=>void;
    SelectFilterDataSource: (dsId:number,label:string)=>void;
    UpdateFilter: (value:string, label:string)=>void;
    ResetFilters: ()=>void;
    SendFilteredRequest: ()=>void;
    GetImageFromApi: (paginate:number,append:boolean)=> void;
    GetNextPage: ()=>void;
  }

const GlobalStateContext = createContext<AppState | undefined>(undefined);

const initialAppData: AppData = {
    start:true,
    photosToValidate: [],
    rejectReasons: [
      { id: 0, label: "-- Wiel e Grond --" },
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
      displayApproved: true,
      displayRefused: true,
      displayPending: true,
      author:null,
      className:null,
      school:0,
      species:0,
    },
    species:[],
    schools:[],
    classNames:[],
    error:null,
    morePhotos:false,
    page:1,
    loading:true,
  };



  
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
    const [appData, setAppData] = useState<AppData>(initialAppData);
    const [timer,setTimer] = useState<NodeJS.Timeout | null>(null);
    const searchParams = useSearchParams();
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
      
      for(let i=1;i<=10;i++){
        let _photo: photo = {
          react_id: i,
          id: i,
          title: "",
          status: "pending_review",
          uid: "",
          studentIam: "BOUNI204",
          imageUrl: "/Bird.png",
          specie: i,
          className: i,
          message: "",
          school: i,
          error: null,
          selected: false,
        };
        photos.push(_photo);
      }
      setAppData((prevAppData) => ({
        ...prevAppData,
        photosToValidate: photos,
      }));
      GetFakeSpecies();
      GetFakeSchools();
      GetFakeClassName();
    };
    const GetFakeSpecies = ()=>{
    
      let species:dataSource[] = [];
      for(let i=1;i<=10;i++){
        species.push({id:i, label:`Specie ${i} (Latine Term ${i})`});
      }
      setAppData((prevAppData) => ({
        ...prevAppData,
        species: species,
      }));
    }
    const GetFakeSchools = ()=>{
    
      let schools:dataSource[] = [];
      for(let i=1;i<=10;i++){
        schools.push({id:i, label:`schools ${i}`});
      }
      setAppData((prevAppData) => ({
        ...prevAppData,
        schools: schools,
      }));
    }
    const GetFakeClassName = ()=>{
    
      let classNames:dataSource[] = [];
      for(let i=1;i<=10;i++){
        classNames.push({id:i, label:`class ${i}`});
      }
      setAppData((prevAppData) => ({
        ...prevAppData,
        classNames: classNames,
      }));
    }



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
      // Load datasources
      GetSpecies();
      GetSchools();
      GetClassNames();
      
    };

    const GetSpecies = () =>{
      // https://hellospring.script.lu/react/species?_format=json
      const config = {
          headers: {
          },
          params:{
          }
      };
      axios.get(DRUPALURL+"react/species?_format=json" ,config).then((res)=>{
          let speciesList:dataSource[] = res.data.map((specieObj:any)=>{ return {id: specieObj.tid_export, label:`${specieObj.name} (${specieObj.field_latin_term})`}});
          setAppData((prevAppData) => ({
            ...prevAppData,
            species: speciesList,
          }));
      }).catch((error)=>{
          SendError("Error fetching species from API");
      }); 
      
    }

    const GetSchools = () =>{
      // https://hellospring.script.lu/react/schools?_format=json
      const config = {
          headers: {
          },
          params:{
          }
      };
       axios.get(DRUPALURL+"react/schools?_format=json" ,config).then((res)=>{
          let schoolsList:dataSource[] = res.data.map((schoolObj:any)=>{ return {id: schoolObj.id, label:schoolObj.name}});
          setAppData((prevAppData) => ({
            ...prevAppData,
            schools: schoolsList,
          }));
      }).catch((error)=>{
          SendError("Error fetching species from API");
      }); 
      
    }

    const GetClassNames = () =>{
      // https://hellospring.script.lu/react/classlist?_format=json
      const config = {
          headers: {
          },
          params:{
          }
      };
       axios.get(DRUPALURL+"react/classlist?_format=json" ,config).then((res)=>{
          let classNamesList:dataSource[] = res.data.map((classNameObj:any)=>{ return {id: classNameObj.id, label:classNameObj.name}});
          setAppData((prevAppData) => ({
            ...prevAppData,
            classNames: classNamesList,
          }));
      }).catch((error)=>{
          SendError("Error fetching species from API");
      }); 
      
    }

    const GetImageFromApi = (paginate:number,append:boolean)=> {
      setAppData((prevAppData) => ({
        ...prevAppData,
        page: paginate,
        loading:true,
      }));
      const config = {
          headers: {
          },
          params:{
          }
      };
      
      const page = searchParams.get('p');
      let finalUrl = page ==="mod"? DRUPALURL+MODERATIONAPI : DRUPALURL+PHOTOAPI;
      finalUrl += `&page=${paginate}`;
     /*  
     if(appData.filter.school !== null && appData.filter.school !== 0){
          finalUrl += `&school_id=${appData.filter.school}`;
      }
      if(appData.filter.species !== null && appData.filter.species !== 0){
        finalUrl += `&specie_id=${appData.filter.species}`;
      }
      if(appData.filter.className !== null && appData.filter.className !== 0){
        finalUrl += `&class_id=${appData.filter.className}`;
      } 
        */
      var photosToValidate:photo[] = [];
      axios.get(finalUrl ,config).then((photoRes)=>{
          
          if(append){
            photosToValidate = appData.photosToValidate;
          }
          var reactId = 1;
          if(append){
            photosToValidate = appData.photosToValidate;
            reactId = appData.photosToValidate.length + 1;
          }
          photoRes.data.forEach((jObject:any)=>{
              var _photo:photo = {
                  react_id: reactId,
                  id: jObject.nid_export,
                  title: "",
                  status: jObject.field_status,
                  uid: jObject.field_author.id,
                  studentIam: jObject.name_export,
                  imageUrl: jObject.field_photo,
                  specie: jObject.field_specie,
                  message: jObject.field_message,
                  className: jObject.field_class_id,
                  school: jObject.school,
                  error: null,
                  selected: false,
              }
              reactId += 1;
              photosToValidate.push(_photo);
          });
          
          HandleLoadingPhotos(photosToValidate.sort((a,b)=>b.id - a.id));
          // Charge next page to see if more results to show
          axios.get(finalUrl.replace(`page=${paginate}`,`page=${paginate+1}`) ,config)
          .then((nextPageRes)=>{
              if(nextPageRes.data.length===0){
                  // NO MORE PHOTOS
                  setAppData((prevAppData) => ({
                    ...prevAppData,
                    morePhotos: false,
                    loading:false,
                  }));
              }else{
                  // MORE PHOTOS AVAILABLE
                  GetImageFromApi(paginate+1,true);
                  
              }
          }
          ).catch((error)=>{
              setAppData((prevAppData) => ({
                ...prevAppData,
                morePhotos: false,
                loading:false,
              }));
              SendError("Error fetching more photos from API : " + error);
          });
  
      }).catch((error)=>{
          setAppData((prevAppData) => ({
            ...prevAppData,
            loading:false,
          }));
          SendError("Error fetching photos from API : " + error);
      });
    
    };

    const GetNextPage = ()=>{
      const nextPage = appData.page + 1;
      GetImageFromApi(nextPage,true);
    }

    const SendFilteredRequest = ()=>{
      console.log("Send Filtered Request with filter:", appData.filter);
    }
    

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
        console.log("Toggle Filter:", type, newFilter);
        return {
          ...prevAppData,
          filter: newFilter,
        };
      });

    }

    const ResetFilters = ()=>{
      setAppData((prevAppData) => {
        let newFilter = {
          displayApproved: true,
          displayRefused: true,
          displayPending: true,
          author:null,
          className:null,
          school:0,
          species:0,
        };
        return {
          ...prevAppData,
          filter: newFilter,
        };
      });
    }

    const SelectFilterDataSource = (dsId:number,label:string)=>{
      switch (label) {
      
        case "species":
          setAppData((prevAppData) => {
            let newFilter = {...prevAppData.filter};
              newFilter.species = dsId;
            return {
              ...prevAppData,
              filter: newFilter,
            };
          });
          break;
        
        case "school":
          setAppData((prevAppData) => {
            let newFilter = {...prevAppData.filter};
              newFilter.school = dsId;
            return {
              ...prevAppData,
              filter: newFilter,
            };
          });
          break;
        case "className":
          setAppData((prevAppData) => {
            let newFilter = {...prevAppData.filter};
              newFilter.className = dsId;
            return {
              ...prevAppData,
              filter: newFilter,
            };
          });
          break;
        default:
          break;
      }
    }

    const UpdateFilter = (value:string, label:string)=>{
      console.log("Update filter:", label, value);
      setAppData((prevAppData) => {
        let newFilter = {...prevAppData.filter};
        switch (label) {
          case "author":
            newFilter.author = value.length>0?value:null;
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

    const TogglePhotoSelection = (photoId:number)=>{
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
      <GlobalStateContext.Provider value={{ appData,GetFakeUser,GetFakeData,SendError,UpdatePhoto,ToggleFilter,TogglePhotoSelection, GetDrupalUser, GetSpecies, GetSchools,HandleLoadingPhotos, HandleBatchAction, UpdateFilter,SelectFilterDataSource,ResetFilters,SendFilteredRequest,GetImageFromApi, GetNextPage}}>
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