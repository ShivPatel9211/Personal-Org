/**
* @File Name : BusinessCardController.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : October 4, 2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | October 4, 2024 |   | Initial Version
**/

public class BusinessCardController {
    @AuraEnabled
    public static String processBusinessCard(String imageUrl) {
        try {
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://business-card-scanner.p.rapidapi.com/processDocument');
            request.setMethod('POST');
            request.setHeader('x-rapidapi-key', '12c1920b6dmsh66df59207cab8cap1a9c4ejsnd4b7a1a1f10e');
            request.setHeader('x-rapidapi-host', 'business-card-scanner.p.rapidapi.com');
            request.setHeader('Content-Type', 'application/json');
            request.setTimeOut(120000);
            String body = '{"extractionDetails": {"name": "Business Card - Extraction","language": "English","fields": [{"key": "name"},{"key": "job_title"},{"key": "company_name"},{"key": "address"},{"key": "phone_numbers"},{"key": "email_addresses"},{"key": "website_url"},{"key" :"city"},{"key" :"country"}, {"key" :"postal_code"},{"key" :"state"},{"key" :"street"}]},"file": "' + imageUrl + '"}';
            request.setBody(body);

            HttpResponse response = http.send(request);

            if (response.getStatusCode() == 200) {
                return response.getBody();
            } else {
                throw new CalloutException('Error in API Call: ' + response.getStatus());
            }
        } catch (Exception e) {
            throw new AuraHandledException('API Call failed: ' + e.getMessage());
        }
    }
        // Wrapper class for Lead details
    public class LeadWrapper {
        @AuraEnabled
        public String name { get; set; }
        @AuraEnabled
        public String jobTitle { get; set; }
        @AuraEnabled
        public String companyName { get; set; }
        @AuraEnabled
        public String address { get; set; }
        @AuraEnabled
        public String phoneNumber { get; set; }
        @AuraEnabled
        public String email { get; set; }
        @AuraEnabled
        public String websiteUrl { get; set; }
        @AuraEnabled
        public String country { get; set; }
        @AuraEnabled
        public String street { get; set; }
        @AuraEnabled
        public String postalCode { get; set; }
        @AuraEnabled
        public String city { get; set; }
        @AuraEnabled
        public String state { get; set; }
    }

    // Method to create a new Lead
    @AuraEnabled
    public static Id createLead(LeadWrapper leadWrapper) {
        Lead newLead = new Lead();
        String[] names = leadWrapper.name.split(' ', 2); // Split the name into first and last

        newLead.FirstName = names[0]; // First part of the name
        newLead.LastName = names.size() > 1 ? names[1] : ''; // Last part of the name
        newLead.Title = leadWrapper.jobTitle;
        newLead.Company = leadWrapper.companyName;
        // newLead.Address = leadWrapper.address;
        newLead.Phone = leadWrapper.phoneNumber;
        newLead.Email = leadWrapper.email;
        newLead.Website = leadWrapper.websiteUrl;
        newLead.country = leadWrapper.country;
        newLead.city = leadWrapper.city;
        newlead.street = leadWrapper.street;
        newLead.postalCode = leadWrapper.postalCode;
        newLead.state = leadWrapper.state;

        insert newLead;
        return newLead.Id;
    }
}