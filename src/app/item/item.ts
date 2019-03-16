import { Unit } from "../unit/unit";
import { Category } from "../category/category";


export class Item {
    id: number;
    productCode: string;
    category: Category;
    barcode: string;
    itemName: string;
    itemType: string;
    itemNameArabic: string;
    serialNumber: string;
    costPrice: number;
    salePrice: number;
    description: string;
    unit: Unit;
    stock: number;
    min: number;
    max: number;
    expiry_date: number;
    image: string;
    stylistCommRate: string;
    serviceTime: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
}
