public class OCRSpaceAPI {
    private static final String OCR_API_URL = 'https://api.ocr.space/parse/image';
    private static final String API_KEY = 'K87228350088957';

    public class OCRResponse {
        public boolean IsErroredOnProcessing;
        public String OCRExitCode;
        public String ParsedText;
        // Add other fields as per the OCR API response
    }

    public static String performOCR(String base64Image) {
        String boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
        String payload = createMultipartPayload(boundary, base64Image);
        HttpRequest req = new HttpRequest();
        req.setEndpoint(OCR_API_URL);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
        req.setHeader('apikey', API_KEY);
        req.setBody(payload);

        Http http = new Http();
        HttpResponse res;
        try {
            res = http.send(req);
            if (res.getStatusCode() == 200) {
                System.debug(res.getBody());
                //OCRResponse ocrResponse = (OCRResponse)JSON.deserialize(res.getBody(), OCRResponse.class);
                return res.getBody();
            } else {
                System.debug('Error: ' + res.getStatus());
                return null;
            }
        } catch (Exception e) {
            System.debug('Exception: ' + e.getMessage());
            return null;
        }
    }

    private static String createMultipartPayload(String boundary, String base64Image) {
        String body = '';
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="apikey"\r\n\r\n';
        body += API_KEY + '\r\n';
        body += '--' + boundary + '\r\n';
        body += 'Content-Disposition: form-data; name="base64Image"\r\n\r\n';
        body += base64Image + '\r\n';
        body += '--' + boundary + '--\r\n';
        return body;
    }
}