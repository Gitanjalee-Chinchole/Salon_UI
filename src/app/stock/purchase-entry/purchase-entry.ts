import { Supplier } from '../../supplier/supplier';
import { PurchaseOrder } from '../purchase-order/purchase-order';

export class Purchase {
    id: number;
    supplierId: Supplier;
    poId: PurchaseOrder;
    supplier_bill_no: number;
    supplier_bill_date: string;
    bill_amount: number;
    vat_amount: number;
    mrn_date: string;
    purchase_mode: string;
    received_by: number;
    sub_total: number;
    discount_amount: number;
    extra_discount: number;
    created_at: string;
    updated_at: string;

}
