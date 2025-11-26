import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getOpportunityProducts from '@salesforce/apex/OpportunityProductsController.getOpportunityProducts';

// Custom Labels
import Opportunity_Products from '@salesforce/label/c.Opportunity_Products';
import No_Product_Opportunity from '@salesforce/label/c.No_Product_Opportunity';
import Product_Name from '@salesforce/label/c.Product_Name';
import Quantity from '@salesforce/label/c.Quantity';
import Unit_Price from '@salesforce/label/c.Unit_Price';
import Total_Price from '@salesforce/label/c.Total_Price';
import Quantity_In_Stock from '@salesforce/label/c.Quantity_In_Stock';
import Delete from '@salesforce/label/c.Delete';
import See_Product from '@salesforce/label/c.See_Product';
import Quantity_Problem_Detail from '@salesforce/label/c.Quantity_Problem_Detail';


export default class OpportunityProducts extends NavigationMixin(LightningElement) {

    @api recordId;

    @track products = [];
    @track isAdmin = false;
    @track isCommercial = false;
    @track error;

    get columns() {

        let cols = [
            { label: Product_Name, fieldName: 'productName' },
            { label: Quantity, fieldName: 'quantity', type: 'text', cellAttributes: { class: { fieldName: 'quantityClass' } } },
            { label: Unit_Price, fieldName: 'unitPrice', type: 'currency' },
            { label: Total_Price, fieldName: 'totalPrice', type: 'currency' },
            { label: Quantity_In_Stock, fieldName: 'quantityInStock', type: 'number' }
        ];

        // DELETE icon column
        cols.push({
            label: Delete,
            type: 'button-icon',
            fixedWidth: 60,
            typeAttributes: {
                iconName: 'utility:delete',
                name: 'delete',
                title: Delete,
                variant: 'bare'
            }
        });

        // VIEW PRODUCT column (Admin only)
        if (this.isAdmin) {
            cols.push({
                label: See_Product,
                type: 'button',
                fixedWidth: 160,
                typeAttributes: {
                    label: See_Product,
                    name: 'view',
                    variant: 'brand',
                    iconName: 'utility:preview',
                    iconPosition: 'left'
                }
            });
        }

        return cols;
    }

    get labelOpportunityProducts() {
        return Opportunity_Products;
    }

    get noProductLines() {
        return No_Product_Opportunity.split(/\r?\n/);
    }

    get hasProducts() {
        return this.products && this.products.length > 0;
    }

    get quantityProblemLabel() {
        return Quantity_Problem_Detail;
    }

    get hasStockError() {
        return this.products.some(p => p.quantity > p.quantityInStock);
    }

    @wire(getOpportunityProducts, { opportunityId: '$recordId' })
    wiredProducts({ error, data }) {
        if (data) {
            this.products = data.products.map(item => {
                const isOverStock = item.quantity > item.quantityInStock;
                return {
                    ...item,
                    quantityClass: isOverStock ? 'qty-error' : 'qty-ok'
                };
            });
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

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;

        switch (actionName) {
            case 'delete':
                this.deleteRow(row);
                break;
            case 'view':
                this.openProduct(row.productId);
                break;
        }
    }

    openProduct(productId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: productId,
                objectApiName: 'Product2',
                actionName: 'view'
            }
        });
    }

    deleteRow(row) {
    this.products = this.products.filter(item => item.id !== row.id);
}
}
