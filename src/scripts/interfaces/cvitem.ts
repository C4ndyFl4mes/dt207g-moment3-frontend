
/**
 * Ett interface för att hantera CV-poster.
 */

export interface ICVItem {
    _id?: string;
    companyname: string;
    jobtitle: string;
    location: string;
    startdate: string;
    enddate: string;
    description: string;
}