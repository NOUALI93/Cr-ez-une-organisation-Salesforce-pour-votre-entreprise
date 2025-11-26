import { LightningElement, api, track, wire } from 'lwc';
import getOpportunityProducts from '@salesforce/apex/OpportunityProductsController.getOpportunityProducts';

// Custom Labels
import Opportunity_Products from '@salesforce/label/c.Opportunity_Products';
import No_Product_Opportunity from '@salesforce/label/c.No_Product_Opportunity';
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import Unit_Price from '@salesforce/label/c.Unit_Price';
import Total_Price from '@salesforce/label/c.Total_Price';
import Quantity_In_Stock from '@salesforce/label/c.Quantity_In_Stock';

export default class OpportunityProducts extends LightningElement {

    @api recordId;

    @track products = [];
    @track isAdmin = false;
    @track isCommercial = false;
    @track error;

    columns = [
        { label: Product_Name, fieldName: 'productName' },
        { label: Quantity, fieldName: 'quantity', type: 'number' },
        { label: Unit_Price, fieldName: 'unitPrice', type: 'currency' },
        { label: Total_Price, fieldName: 'totalPrice', type: 'currency' },
        { label: Quantity_In_Stock, fieldName: 'quantityInStock', type: 'number' }
    ];

    get labelOpportunityProducts() {
        return Opportunity_Products;
    }

    get noProductLines() {
        return No_Product_Opportunity.split(/\r?\n/);
    }

    get hasProducts() {
        return this.products && this.products.length > 0;
    }

    @wire(getOpportunityProducts, { opportunityId: '$recordId' })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.products;
            this.isAdmin = data.isAdmin;
            this.isCommercial = data.isCommercial;
            this.error = undefined;
        } else if (error) {
            if (error.body) {
                this.error = error.body.message;
            } else {
                this.error = error.message;
            }
            this.products = [];
        }
    }
}
