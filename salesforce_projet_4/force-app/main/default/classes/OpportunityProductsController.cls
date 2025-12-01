public with sharing class OpportunityProductsController {

    @AuraEnabled(cacheable=true)
    public static OpportunityProductsResult getOpportunityProducts(Id opportunityId) {

        // Get current user profile
        String profileName = [
            SELECT Profile.Name FROM User WHERE Id = :UserInfo.getUserId()
        ].Profile.Name;

        Boolean isAdmin = profileName == 'System Administrator';
        Boolean isCommercial = profileName == 'Commercial';

        // Query OpportunityLineItems
        List<OpportunityLineItem> oliList = [
            SELECT Id,
                   OpportunityId,
                   Quantity,
                   UnitPrice,
                   TotalPrice,
                   PricebookEntry.Product2Id,
                   PricebookEntry.Product2.Name,
                   PricebookEntry.Product2.QuantityInStock__c
            FROM OpportunityLineItem
            WHERE OpportunityId = :opportunityId
        ];

        // Map to DTO
        List<OpportunityProductDTO> dtoList = new List<OpportunityProductDTO>();
        for (OpportunityLineItem oli : oliList) {
            dtoList.add(new OpportunityProductDTO(oli));
        }

        // Return result with role flags
        return new OpportunityProductsResult(dtoList, isAdmin, isCommercial);
    }

    // Wrapper to hold DTO list + user roles
    public class OpportunityProductsResult {
        @AuraEnabled public List<OpportunityProductDTO> products;
        @AuraEnabled public Boolean isAdmin;
        @AuraEnabled public Boolean isCommercial;

        public OpportunityProductsResult(
            List<OpportunityProductDTO> products,
            Boolean isAdmin,
            Boolean isCommercial
        ) {
            this.products = products;
            this.isAdmin = isAdmin;
            this.isCommercial = isCommercial;
        }
    }

    // DTO for each OpportunityLineItem
    public class OpportunityProductDTO {
        @AuraEnabled public Id id;
        @AuraEnabled public String productName;
        @AuraEnabled public Decimal quantity;
        @AuraEnabled public Decimal unitPrice;
        @AuraEnabled public Decimal totalPrice;
        @AuraEnabled public Decimal quantityInStock;
        @AuraEnabled public Id productId;

        public OpportunityProductDTO(OpportunityLineItem oli) {
            this.id = oli.Id;
            this.productName = oli.PricebookEntry.Product2.Name;
            this.quantity = oli.Quantity;
            this.unitPrice = oli.UnitPrice;
            this.totalPrice = oli.TotalPrice;
            this.quantityInStock = oli.PricebookEntry.Product2.QuantityInStock__c;
            this.productId = oli.PricebookEntry.Product2Id;
        }
    }

    @AuraEnabled
    public static void deleteOpportunityProduct(Id opportunityLineItemId) {

        // Get the line item with related product
        OpportunityLineItem oli = [
            SELECT Id 
            FROM OpportunityLineItem
            WHERE Id = :opportunityLineItemId
            LIMIT 1
        ];

        // Delete the line item
        delete oli;
    }

}
