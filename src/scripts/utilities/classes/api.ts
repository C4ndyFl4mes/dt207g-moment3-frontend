import { ICVItem } from "../../interfaces/cvitem";
import { IError } from "../../interfaces/error";

/**
 * En utility klass för att hantera REST API:n för CV.
 */


export class API {
    private static URL: string = "https://dt207g-moment3-backend.onrender.com/cv"; // Samma URL oavsett metod.
    private static header: HeadersInit = {"content-type": "application/json"}; // Samma header oavsett metod.

    /**
     * Hämtar data från API:et.
     * @returns en array eller ett error.
     */
    public static async read(): Promise<Array<ICVItem> | IError> {
        const resp: Response | null = await fetch(this.URL, {
            method: "GET",
            headers: this.header
        });
        if (!resp) {
            return {valid: false, message: {header: "Respons fel", message: "Fick ingen respons vid hämtning."}};
        }
        const data: Array<ICVItem> | IError = await resp.json();
        return data;
    }

    /**
     * Lägger till ett cv-item till API:et.
     * @param item - ett objekt som innehåller ett cv-item, innehåller inte id.
     * @returns 
     */
    public static async write(item: ICVItem): Promise<IError> {
        if (!API.checkFieldsBeforeRequest(item).valid) {
            return API.checkFieldsBeforeRequest(item);
        }
        const resp: Response | null = await fetch(this.URL, {
            method: "POST",
            headers: this.header,
            body: JSON.stringify(item)
        });
        if (!resp) {
            return {valid: false, message: {header: "Respons fel", message: "Fick ingen respons vid lägg till."}};
        }
        const validation: IError = await resp.json();
        return validation;
    }

    /**
     * Ändrar ett cv-item i API:et.
     * @param item - ett objekt som innehåller ett cv-item, innehåller id.
     * @returns ett error som kan vara true eller false beroende på hur det går.
     */
    public static async edit(item: ICVItem): Promise<IError> {
        if (!API.checkFieldsBeforeRequest(item).valid) {
            return API.checkFieldsBeforeRequest(item);
        }
        const resp: Response | null = await fetch(this.URL+`/${item._id}`, {
            method: "PUT",
            headers: this.header,
            body: JSON.stringify(item)
        });
        if (!resp) {
            return {valid: false, message: {header: "Respons fel", message: "Fick ingen respons vid ändring."}};
        }
        const validation: IError = await resp.json();
        return validation;
    }

    /**
     * Raderar ett cv-item i API:et.
     * @param id - Ett unikt nummer som ska mostvara ett cv-item i API:et.
     * @returns 
     */
    public static async remove(id: string): Promise<IError> {
        const resp: Response | null = await fetch(this.URL+`/${id}`, {
            method: "DELETE",
            headers: this.header
        });
        if (!resp) {
            return {valid: false, message: {header: "Respons fel", message: "Fick ingen respons vid radering."}};
        }
        const validation: IError = await resp.json();
        return validation;
    }

    /**
     * Kollar om ett objekt är av Interface:et IError.
     * @param data - vilket objekt som helst.
     * @returns - sant om data är ett error.
     */
    public static isError(data: any): data is IError {
        return (
            typeof data === "object" &&
            data !== null &&
            "valid" in data &&
            typeof data.valid === "boolean" &&
            "message" in data &&
            typeof data.message === "string"
          );
    }

    /**
     * Kollar om det är korrekt inmatning.
     * @param item - det CV objekt som ska kollas.
     * @returns ett error, viktigast är valid-egenskapen.
     */
    private static checkFieldsBeforeRequest(item: ICVItem): IError {
        // Är ganska stolt över att jag hittade denna lösning på internet och slipper en switch sats för att översätta.
        const translationMap: Record<string, string> = {
            company: "företag",
            jobtitle: "arbetsuppgift",
            location: "plats",
            startdate: "inledningsdatum",
            enddate: "avslutningsdatum",
            description: "beskrivning"
        };
        const fields = Object.entries(item).map(([key, value]) => ({ key, value }));
        const emptyFields = fields.filter(field => field.value === "");
        
        if (emptyFields.length !== 0) {
            const emptyFieldsText: string = emptyFields.map(field => translationMap[field.key] || field.key).join(", ");
            return {valid: false, message: {header: "Tomma fält", message: `Det finns tomma fält: ${emptyFieldsText}`}};
        } else if (new Date(item.enddate) < new Date(item.startdate)) {
            return {valid: false, message: {header: "Ologisk tidsperiod", message: `Förhoppningsvis kan inte inledningsdatum komma efter avslutningsdatum.`}};
        } else {
            return {valid: true, message: {header: "Korrektinmatning", message: `Allt är som det ska.`}};

        }
    }
}