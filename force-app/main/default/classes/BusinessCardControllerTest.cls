@isTest
public class BusinessCardControllerTest {
    @isTest
    static void testProcessBusinessCard() {
        // Set mock response for the HTTP callout
        Test.startTest();
        
        // Mock HTTP Response
        HttpResponse mockResponse = new HttpResponse();
        mockResponse.setHeader('Content-Type', 'application/json');
        mockResponse.setBody('{"name": "John Doe", "job_title": "CEO", "company_name": "Acme Corp", "address": "123 Main St", "phone_numbers": ["123-456-7890"], "email_addresses": ["john.doe@example.com"], "website_url": "http://acme.com"}');
        mockResponse.setStatusCode(200);

        // Define the mock behavior for HTTP callout
        HttpCalloutMock mock = new MockHttpResponseGenerator(mockResponse);
        Test.setMock(HttpCalloutMock.class, mock);
        
        // Call the actual method
        String imageUrl = 'http://example.com/businesscard.jpg';
        String responseBody = BusinessCardController.processBusinessCard(imageUrl);
        
        // Assertions to verify the response
        System.assertNotEquals(null, responseBody, 'The response should not be null');
        System.assert(responseBody.contains('John Doe'), 'Response should contain the extracted name');

        Test.stopTest();
    }

    @isTest
    static void testCreateLead() {
        Test.startTest();
        
        // Prepare test data for LeadWrapper
        BusinessCardController.LeadWrapper leadWrapper = new BusinessCardController.LeadWrapper();
        leadWrapper.name = 'Jane Doe';
        leadWrapper.jobTitle = 'CTO';
        leadWrapper.companyName = 'Tech Corp';
        leadWrapper.phoneNumber = '987-654-3210';
        leadWrapper.email = 'jane.doe@techcorp.com';
        leadWrapper.websiteUrl = 'http://techcorp.com';
        leadWrapper.country = 'USA';
        leadWrapper.city = 'San Francisco';
        leadWrapper.street = '456 Tech Way';
        leadWrapper.postalCode = '94105';
        leadWrapper.state = 'CA';

        // Call the createLead method
        Id leadId = BusinessCardController.createLead(leadWrapper);
        
        // Retrieve the inserted Lead
        Lead createdLead = [SELECT Id, FirstName, LastName, Title, Company, Phone, Email, Website, City, State, Country, PostalCode, Street 
                            FROM Lead WHERE Id = :leadId];
        
        // Assertions to verify the Lead record is correctly created
        System.assertEquals('Jane', createdLead.FirstName, 'First name should be "Jane"');
        System.assertEquals('Doe', createdLead.LastName, 'Last name should be "Doe"');
        System.assertEquals('CTO', createdLead.Title, 'Job title should be "CTO"');
        System.assertEquals('Tech Corp', createdLead.Company, 'Company name should be "Tech Corp"');
        System.assertEquals('987-654-3210', createdLead.Phone, 'Phone number should match');
        System.assertEquals('jane.doe@techcorp.com', createdLead.Email, 'Email should match');
        System.assertEquals('http://techcorp.com', createdLead.Website, 'Website URL should match');
        System.assertEquals('San Francisco', createdLead.City, 'City should match');
        System.assertEquals('CA', createdLead.State, 'State should match');
        System.assertEquals('USA', createdLead.Country, 'Country should match');
        System.assertEquals('94105', createdLead.PostalCode, 'Postal code should match');
        System.assertEquals('456 Tech Way', createdLead.Street, 'Street should match');

        Test.stopTest();
    }
    
    // Mock class for HTTP Callout
    private class MockHttpResponseGenerator implements HttpCalloutMock {
        HttpResponse mockResponse;
        
        MockHttpResponseGenerator(HttpResponse response) {
            this.mockResponse = response;
        }
        
        public HttpResponse respond(HttpRequest req) {
            return mockResponse;
        }
    }
}