@IsTest
public class OpportunityProductsControllerTest {

    @testSetup
    static void setupData() {

        // GET STANDARD PRICEBOOK ID (MANDATORY IN TESTS)
        Id stdPricebookId = Test.getStandardPricebookId();

        // CREATE TEST PRODUCT
        Product2 prod = new Product2(
            Name = 'Test Laptop',
            IsActive = true,
            QuantityInStock__c = 10
        );
        insert prod;

        // CREATE PRICEBOOK ENTRY
        PricebookEntry pbe = new PricebookEntry(
            Product2Id = prod.Id,
            Pricebook2Id = stdPricebookId,
            UnitPrice = 1000,
            IsActive = true
        );
        insert pbe;

        // CREATE OPPORTUNITY
        Opportunity opp = new Opportunity(
            Name = 'Test Opportunity',
            CloseDate = Date.today().addDays(30),
            StageName = 'Prospecting'
        );
        insert opp;

        // CREATE OPPORTUNITY LINE ITEM
        OpportunityLineItem oli = new OpportunityLineItem(
            OpportunityId = opp.Id,
            PricebookEntryId = pbe.Id,
            Quantity = 2,
            UnitPrice = 1000
        );
        insert oli;
    }

    @IsTest
    static void testGetOpportunityProducts() {
        Opportunity opp = [SELECT Id FROM Opportunity LIMIT 1];

        Test.startTest();
        OpportunityProductsController.OpportunityProductsResult result =
            OpportunityProductsController.getOpportunityProducts(opp.Id);
        Test.stopTest();

        System.assertNotEquals(null, result);
        System.assertEquals(1, result.products.size());

        System.assertEquals('Test Laptop', result.products[0].productName);
        System.assertEquals(2, result.products[0].quantity);
        System.assertEquals(10, result.products[0].quantityInStock);

        System.assertNotEquals(null, result.isAdmin);
        System.assertNotEquals(null, result.isCommercial);
    }

    @IsTest
    static void testDeleteOpportunityProduct() {
        OpportunityLineItem oli = [SELECT Id FROM OpportunityLineItem LIMIT 1];

        Test.startTest();
        OpportunityProductsController.deleteOpportunityProduct(oli.Id);
        Test.stopTest();

        Integer countOli = [
            SELECT COUNT() FROM OpportunityLineItem WHERE Id = :oli.Id
        ];

        System.assertEquals(0, countOli);
    }
}
