export class Appointments {
    id: number;
    appointement_date: string;
    customer: any;
    stylist: any;
    status: string;
    services: Array<Services>;
    constructor() {
        this.services = new Array<Services>();
    }
}

export class Services {
    id: number;
    itemName: string;
    serviceTime: string;
}
