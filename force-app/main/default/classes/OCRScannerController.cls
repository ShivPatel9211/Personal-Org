public class OCRScannerController {
    // @AuraEnabled
    // public static string getOCResponseBase64(String base64Data) {
    //     System.debug('called from frontend');
    //     try {
    //         return OCRSpaceAPI.performOCR(base64Data);
    //     } catch (Exception e) {
    //         throw new AuraHandledException(e.getMessage());
    //     }
    // }

    @AuraEnabled
    public static String createLead(string LeadInfo){
        System.debug('Lead Info ' + LeadInfo);
        try {
            LeadWrapper data = (LeadWrapper)JSON.deserialize(
                LeadInfo, LeadWrapper.class
            );
            System.debug(data);
            Lead newLead = new Lead();
            List<String> name = data.name.split(' ');
            if (name.size() > 1) {
                newLead.FirstName = data.name.split(' ')[0];
                newLead.LastName = data.name.split(' ')[1];
            }
            else {
                newLead.LastName = data.name.split(' ')[0];
            }
            newLead.Email = data.email;
            newLead.Title = data.title;
            newLead.Company = data.companyName;
            newLead.MobilePhone = data.phone;
            newLead.Website = data.website;
            insert newLead;
            return newLead.Id;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class LeadWrapper{
        @AuraEnabled
        public string name;
        @AuraEnabled
        public string title;
        @AuraEnabled
        public string companyName;
        @AuraEnabled
        public string address;
        @AuraEnabled
        public string phone;
        @AuraEnabled 
        public string email;
        @AuraEnabled
        public string website;
    }
}