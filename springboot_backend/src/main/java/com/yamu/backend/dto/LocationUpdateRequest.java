package com.yamu.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.Optional;

@Getter
@Setter
public class LocationUpdateRequest {
    private long id;
    private String name;
    private Optional<Double> longitude = Optional.empty();
    private Optional<Double> latitude = Optional.empty();
}