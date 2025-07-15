package com.yamu.backend.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.azure.core.credential.AzureKeyCredential;
import com.azure.search.documents.SearchClient;
import com.azure.search.documents.SearchClientBuilder;
import com.azure.search.documents.models.SearchOptions;
import com.azure.search.documents.models.SuggestOptions;
import com.azure.search.documents.models.FacetResult;
import com.azure.search.documents.util.SearchPagedIterable;
import com.azure.search.documents.util.SuggestPagedIterable;
import com.azure.search.documents.models.SearchResult;
import com.azure.search.documents.models.SuggestResult;
import com.azure.search.documents.SearchDocument;
import com.yamu.backend.dto.GuideSearchResponse;
import com.yamu.backend.dto.GuideSearchResult;

@Service
public class GuideSearchService {
    
    private final SearchClient searchClient;
    
    public GuideSearchService(@Value("${azure.search.guide.endpoint}") String endpoint,
                             @Value("${azure.search.guide.api-key}") String apiKey,
                             @Value("${azure.search.guide.index-name}") String indexName) {
        this.searchClient = new SearchClientBuilder()
            .endpoint(endpoint)
            .credential(new AzureKeyCredential(apiKey))
            .indexName(indexName)
            .buildClient();
    }
    
    public GuideSearchResponse searchGuides(String query, List<String> filters, int page, int size, 
                                           String orderBy, List<String> facetFields) {
        SearchOptions searchOptions = new SearchOptions()
            .setTop(size)
            .setSkip(page * size)
            .setHighlightFields("first_name", "last_name", "guide_about", "review_comment", "reservation_places")
            .setIncludeTotalCount(true);
        
        // Add filters
        if (filters != null && !filters.isEmpty()) {
            searchOptions.setFilter(String.join(" and ", filters));
        }
        
        // Add ordering
        if (orderBy != null && !orderBy.isEmpty()) {
            searchOptions.setOrderBy(orderBy);
        }
        
        // Add facets
        if (facetFields != null && !facetFields.isEmpty()) {
            searchOptions.setFacets(facetFields.toArray(new String[0]));
        }
        
        SearchPagedIterable results = searchClient.search(query, searchOptions, null);
        
        List<GuideSearchResult> guideResults = new ArrayList<>();
        Map<String, List<String>> facets = new HashMap<>();
        
        // Process search results
        for (SearchResult result : results) {
            GuideSearchResult guideResult = mapSearchDocumentToGuideResult(result.getDocument(SearchDocument.class));
            guideResults.add(guideResult);
        }
        
        // Process facets
        if (results.getFacets() != null) {
            for (Map.Entry<String, List<FacetResult>> facetEntry : results.getFacets().entrySet()) {
                List<String> facetValues = facetEntry.getValue().stream()
                    .<String>map(fr -> fr.getAdditionalProperties().get("value") + " (" + fr.getCount() + ")")
                    .collect(Collectors.toList());
                facets.put(facetEntry.getKey(), facetValues);
            }
        }
        
        GuideSearchResponse response = new GuideSearchResponse(
            results.getTotalCount(),
            guideResults,
            page,
            size
        );
        response.setFacets(facets);
        
        return response;
    }
    
    public List<String> getSuggestions(String query) {
        SuggestPagedIterable suggestions = searchClient.suggest(query, "sg-guides");
        
        return suggestions.stream()
            .limit(5)
            .map(SuggestResult::getText)
            .collect(Collectors.toList());
    }
    
    public GuideSearchResult getGuideById(String guideId) {
        try {
            SearchDocument doc = searchClient.getDocument(guideId, SearchDocument.class);
            return mapSearchDocumentToGuideResult(doc);
        } catch (Exception e) {
            return null;
        }
    }
    
    // Helper method to map SearchDocument to GuideSearchResult
    private GuideSearchResult mapSearchDocumentToGuideResult(SearchDocument doc) {
        GuideSearchResult result = new GuideSearchResult();
        
        // Basic guide info
        result.setSearchKey(getStringValue(doc, "search_key"));
        result.setGuideId(getStringValue(doc, "guide_id"));
        result.setFirstName(getStringValue(doc, "first_name"));
        result.setLastName(getStringValue(doc, "last_name"));
        result.setEmail(getStringValue(doc, "email"));
        result.setAddress(getStringValue(doc, "address"));
        result.setContactNumber(getStringValue(doc, "contact_number"));
        result.setProfileImageUrl(getStringValue(doc, "profile_image_url"));
        result.setVerified(getBooleanValue(doc, "is_verified"));
        result.setGuideAbout(getStringValue(doc, "guide_about"));
        result.setExpertiseCityRegion(getStringValue(doc, "expertise_city_region"));
        result.setGuideLanguage(getStringValue(doc, "guide_language"));
        
        // Vehicle info
        result.setVehicleId(getStringValue(doc, "vehicle_id"));
        result.setVehicleModel(getStringValue(doc, "vehicle_model"));
        result.setVehicleType(getStringValue(doc, "vehicle_type"));
        result.setVehicleCapacity(getIntValue(doc, "vehicle_capacity"));
        result.setVehicleAirConditioned(getBooleanValue(doc, "vehicle_air_conditioned"));
        result.setVehicleAvailable(getBooleanValue(doc, "vehicle_available"));
        result.setVehicleImageUrl(getStringValue(doc, "vehicle_image_url"));
        
        // Review info
        result.setReviewId(getStringValue(doc, "review_id"));
        result.setReviewComment(getStringValue(doc, "review_comment"));
        result.setReviewRating(getIntValue(doc, "review_rating"));
        result.setReviewCreatedAt(getDateTimeValue(doc, "review_created_at"));
        result.setReviewerId(getStringValue(doc, "reviewer_id"));
        
        // Reservation info
        result.setReservationId(getStringValue(doc, "reservation_id"));
        result.setReservationStatus(getStringValue(doc, "reservation_status"));
        result.setNumberOfDays(getIntValue(doc, "number_of_days"));
        result.setEstimatedPrice(getDoubleValue(doc, "estimated_price"));
        result.setReservationPlaces(getStringValue(doc, "reservation_places"));
        result.setReservationDates(getStringValue(doc, "reservation_dates"));
        result.setMaxTravelers(getIntValue(doc, "max_travelers"));
        
        // Aggregated statistics
        result.setTotalVehicles(getIntValue(doc, "total_vehicles"));
        result.setTotalReviews(getIntValue(doc, "total_reviews"));
        result.setAverageRating(getDoubleValue(doc, "average_rating"));
        result.setTotalReservations(getIntValue(doc, "total_reservations"));
        result.setCompletedReservations(getIntValue(doc, "completed_reservations"));
        result.setConfirmedReservations(getIntValue(doc, "confirmed_reservations"));
        result.setPendingReservations(getIntValue(doc, "pending_reservations"));
        
        return result;
    }
    
    // Helper methods for safe value extraction
    private String getStringValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        return value != null ? value.toString() : "";
    }
    
    private Integer getIntValue(SearchDocument doc, String fieldName) {
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
    
    private Boolean getBooleanValue(SearchDocument doc, String fieldName) {
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
    
    private Double getDoubleValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        if (value != null) {
            if (value instanceof Double) {
                return (Double) value;
            } else {
                try {
                    return Double.parseDouble(value.toString());
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            }
        }
        return 0.0;
    }
    
    private LocalDateTime getDateTimeValue(SearchDocument doc, String fieldName) {
        Object value = doc.get(fieldName);
        if (value != null) {
            try {
                return LocalDateTime.parse(value.toString(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }
}