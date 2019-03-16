import { Supplier } from '../../supplier/supplier';

export class PurchaseOrder {
    id: number;
    purchase_order_date: string;
    supplierId: Supplier;
    status: string;
    created_at: string;
    updated_at: string;

}
