import { Purchase } from "../purchase-entry/purchase-entry";
import { Supplier } from "../../supplier/supplier";

export class PurchaseReturn {
    id: number;
    supplierId: Supplier;
    supplier_bill_no: number;
    supplier_bill_date: string;
    bill_amount: number;
    vat_amount: number;
    return_date: string;
    return_through: string;
    sub_total: number;
    discount_amount: number;
    extra_discount: number;
    created_at: string;
    updated_at: string;
}