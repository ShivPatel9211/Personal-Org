@isTest
public class OCRScannerControllerTest {
    @IsTest
    static void testCase1() {
        OCRScannerController.LeadWrapper wrapper = new OCRScannerController.LeadWrapper();
        wrapper.name = 'test name';
        wrapper.title = 'title';
        wrapper.companyName = 'xyz';
        wrapper.address = 'address';
        wrapper.phone = '212442342341';
        wrapper.email = 'test@test.com';
        wrapper.website = 'test.com';
        OCRScannerController.createLead(Json.serialize(wrapper));
    }
    @isTest
    static void testCase2(){
        try {
          OCRScannerController.createLead('test');  
        }
        catch(exception e) {
            
        }
        
    }
    
    @IsTest
    static void testCase3() {
        OCRScannerController.LeadWrapper wrapper = new OCRScannerController.LeadWrapper();
        wrapper.name = 'name';
        wrapper.title = 'title';
        wrapper.companyName = 'xyz';
        wrapper.address = 'address';
        wrapper.phone = '212442342341';
        wrapper.email = 'test@test.com';
        wrapper.website = 'test.com';
        OCRScannerController.createLead(Json.serialize(wrapper));
    }
}