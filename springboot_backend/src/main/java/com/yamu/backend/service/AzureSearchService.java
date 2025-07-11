package com.yamu.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.azure.core.credential.AzureKeyCredential;
import com.azure.search.documents.SearchClient;
import com.azure.search.documents.SearchClientBuilder;
import com.azure.search.documents.models.SearchOptions;
import com.azure.search.documents.models.SuggestOptions;
import com.azure.search.documents.util.SearchPagedIterable;
import com.azure.search.documents.util.SuggestPagedIterable;
import com.azure.search.documents.models.SearchResult;
import com.azure.search.documents.models.SuggestResult;
import com.azure.search.documents.SearchDocument;
import com.yamu.backend.dto.SearchResponse;
import com.yamu.backend.dto.UserSearchResult;

@Service
public class AzureSearchService {
    
    private final SearchClient searchClient;
    
    public AzureSearchService(@Value("${azure.search.endpoint}") String endpoint,
                             @Value("${azure.search.api-key}") String apiKey,
                             @Value("${azure.search.index-name}") String indexName) {
        this.searchClient = new SearchClientBuilder()
            .endpoint(endpoint)
            .credential(new AzureKeyCredential(apiKey))
            .indexName(indexName)
            .buildClient();
    }
    
    public SearchResponse searchUsers(String query, List<String> filters, int page, int size) {
        SearchOptions searchOptions = new SearchOptions()
            .setTop(size)
            .setSkip(page * size)
            .setHighlightFields("first_name", "last_name", "guide_about")
            .setIncludeTotalCount(true);
        
        if (filters != null && !filters.isEmpty()) {
            searchOptions.setFilter(String.join(" and ", filters));
        }
        
        // Fixed: Use the correct search method with SearchOptions
        SearchPagedIterable results = searchClient.search(query, searchOptions, null);
        
        List<UserSearchResult> userResults = new ArrayList<>();
        for (SearchResult result : results) {
            UserSearchResult userResult = new UserSearchResult();
            // Fixed: Use SearchDocument instead of Document
            SearchDocument doc = result.getDocument(SearchDocument.class);
            
            // Map fields from Azure Search document to DTO with null checks
            userResult.setId(getStringValue(doc, "id"));
            userResult.setUserId(getIntValue(doc, "user_id"));
            userResult.setRole(getStringValue(doc, "role"));
            userResult.setFirstName(getStringValue(doc, "first_name"));
            userResult.setLastName(getStringValue(doc, "last_name"));
            userResult.setEmail(getStringValue(doc, "email"));
            userResult.setAddress(getStringValue(doc, "address"));
            userResult.setContactNumber(getStringValue(doc, "contact_number"));
            userResult.setProfileImageUrl(getStringValue(doc, "profile_image_url"));
            userResult.setVerified(getBooleanValue(doc, "is_verified"));
            userResult.setNationality(getStringValue(doc, "nationality"));
            userResult.setGuideAbout(getStringValue(doc, "guide_about"));
            userResult.setExpertiseCityRegion(getStringValue(doc, "expertise_city_region"));
            userResult.setGuideLanguage(getStringValue(doc, "guide_language"));
            
            userResults.add(userResult);
        }
        
        return new SearchResponse(
            results.getTotalCount(),
            userResults,
            page,
            size
        );
    }
    
    public List<String> getSuggestions(String query) {
        // The suggestOptions argument is not supported in this SDK version.
        SuggestPagedIterable suggestions = searchClient.suggest(query, "sg-users");
        
        // Limit results to top 5 and collect suggestion texts
        return suggestions.stream()
            .limit(5)
            .map(SuggestResult::getText)
            .collect(Collectors.toList());
    }
    
    // Helper methods to safely extract values from SearchDocument
    private String getStringValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        return value != null ? value.toString() : "";
    }
    
    private int getIntValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        if (value != null) {
            if (value instanceof Integer) {
                return (Integer) value;
            } else {
                try {
                    return Integer.parseInt(value.toString());
                } catch (NumberFormatException e) {
                    return 0;
                }
            }
        }
        return 0;
    }
    
    private boolean getBooleanValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        if (value != null) {
            if (value instanceof Boolean) {
                return (Boolean) value;
            } else {
                return Boolean.parseBoolean(value.toString());
            }
        }
        return false;
    }
}