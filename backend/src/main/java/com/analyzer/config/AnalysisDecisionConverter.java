package com.analyzer.config;

import com.analyzer.model.AnalysisResult;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Maps {@link AnalysisResult.Decision} to DB values. Schemas often use lowercase
 * ENUMs (selected/consider/rejected) while Java uses SELECTED/CONSIDER/REJECTED.
 */
@Converter(autoApply = false)
public class AnalysisDecisionConverter implements AttributeConverter<AnalysisResult.Decision, String> {

    @Override
    public String convertToDatabaseColumn(AnalysisResult.Decision attribute) {
        if (attribute == null) {
            return AnalysisResult.Decision.CONSIDER.name().toLowerCase();
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public AnalysisResult.Decision convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return AnalysisResult.Decision.CONSIDER;
        }
        try {
            return AnalysisResult.Decision.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return AnalysisResult.Decision.CONSIDER;
        }
    }
}
