/**
* @File Name : FileController.cls
* @Description :
* @Author :
* @Last Modified By :
* @Last Modified On : October 12, 2024
* @Modification Log :
*==============================================================================
* Ver | Date | Author | Modification
*==============================================================================
* 1.0 | October 12, 2024 |   | Initial Version
**/

public class FileController {
	@AuraEnabled(cacheable=true)
    public static List<ContentDocumentLink> getRelatedFiles(Id recordId) {
        return [
            SELECT ContentDocumentId, ContentDocument.Title, ContentDocument.FileExtension,
                   ContentDocument.LatestPublishedVersionId
            FROM ContentDocumentLink 
            WHERE LinkedEntityId = :recordId
        ];
    }
}