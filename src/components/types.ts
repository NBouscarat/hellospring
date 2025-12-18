

// INTERFACES
export interface AppData {
    error: string | null;
    start: boolean;
    rejectReasons: rejectReason[];
    photosToValidate: photo[];
    userTypes:userType[];
    user?: appUser;
    filter:{
        displayRefused: boolean;
        displayApproved: boolean;
        displayPending: boolean;
        species:number | null;
        author:string | null;
        className:number | null;
        school:number | null;
    };
    species: dataSource[];
    schools: dataSource[];
    classNames: dataSource[];
    morePhotos: boolean;
    page:number;
    loading:boolean;
    
    
};

// CONST STRING
export const REVERT_RIGHT:string = "canRevert";
export const DELETE_RIGHT:string = "canDelete";
export const APPROVED_RIGHT:string = "canApproved";
export const REFUSED_RIGHT:string = "canRefused";

export const STATUS_PENDING_REVIEW:photoStatus = "pending_review";
export const STATUS_APPROVED:photoStatus = "approved";
export const STATUS_REFUSED:photoStatus = "refused";
export const STATUS_DELETED:photoStatus = "deleted";

export const FILTER_APPROVED:string = "approved";
export const FILTER_REFUSED:string = "refused";
export const FILTER_PENDING:string = "pending";

export const USERTYPE_ADMINISTRATOR:string = "administrator";
export const USERTYPE_CONTENT_EDITOR:string = "content_editor";
export const USERTYPE_TEACHER:string = "teacher";



// TYPES
export type rejectReason = {id:number, label: string};
export type rights = right[];
export type right = string;
export type photoStatus = string;
export type userType = {
    id: number,
    label: string,
    rights: rights
}
export type appUser = {
    id: number,
    name: string,
    roles: string[],
    rights:string[],
}
export type photo = {
    react_id: number,
    id: number,
    title: string,
    status: photoStatus,
    uid: string,
    studentIam: string,
    imageUrl: string,
    specie: number,
    message: string,
    className:number,
    error: string | null,
    selected: boolean,
    school:number,
}
export type dataSource = {
    id: number,
    label: string
}

export type studentUser = {
    id: string,
    iam: string,
    photos: photo[]
}

export type schoolClass = {
    id: string,
    className: string,
    students: studentUser[]
}

