package com.analyzer.config;

import com.analyzer.model.HrUser;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = false)
public class HrUserRoleConverter implements AttributeConverter<HrUser.Role, String> {

    @Override
    public String convertToDatabaseColumn(HrUser.Role attribute) {
        if (attribute == null) return HrUser.Role.HR.name();
        return attribute.name();
    }

    @Override
    public HrUser.Role convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return HrUser.Role.HR;
        try {
            return HrUser.Role.valueOf(dbData.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return HrUser.Role.HR;
        }
    }
}
