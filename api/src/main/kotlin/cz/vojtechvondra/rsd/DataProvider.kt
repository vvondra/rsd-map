package cz.vojtechvondra.rsd

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import org.geojson.Feature
import org.geojson.FeatureCollection
import org.geojson.GeoJsonObject
import org.geojson.Point
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.stream.Collectors.toList

@Component
class DataProvider {

    private val data: List<Project> = objectMapper()
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("data.json"))

    val regions: List<Region> = objectMapper()
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("region.json"))

    val roads: List<Road> = objectMapper()
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("road.json"))

    fun findData(region: List<String>, poiType: String?, road: String?): List<Project> {
        return data.stream()
            .filter { t -> t.poiType == "construction" }
            .filter { t -> region.isEmpty() || t.regions.intersect(region).count() > 0 }
            .filter { t -> poiType == null || t.poiType == poiType }
            .filter { t -> road == null || t.road._id == road }
            .collect(toList())
    }

    fun toGeoJson(projects: List<Project>): GeoJsonObject {
        val collection = FeatureCollection()

        collection.addAll(
            projects.map { project ->
                val feature = Feature()
                feature.id = project._id
                feature.geometry = Point(project.gMarker.lng, project.gMarker.lat)
                feature.setProperty("description", project.defaultDescription())
                feature.setProperty("poiType", project.poiType)
                feature.setProperty("roadName", project.road.name)
                feature.setProperty("roadType", project.road.roadType)
                feature.setProperty("title", project.defaultTitle())

                feature
            }
        )

        return collection
    }
}

data class Region(val _id: String, val name: String, val shortcut: String)

data class Road(val _id: String, val name: String, val roadType: String)

data class Coords(val lat: Double, val lng: Double)

data class Project(
    val _id: String,
    val modifiedOn: OffsetDateTime,
    val europeanUnionFund: Boolean,
    val published: Boolean,
    val road: Road,
    val regions: List<String>,
    private val description: Map<String, String> = emptyMap(),
    private val title: Map<String, String>,
    val poiType: String,
    val gMarker: Coords
) {
    fun defaultTitle() = title[title.keys.first()]
    fun defaultDescription() = if (description.count() > 0) description[description.keys.first()] else ""
}

private fun objectMapper(): ObjectMapper {
    return jacksonObjectMapper()
        .registerModule(Jdk8Module())
        .registerModule(JavaTimeModule())
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
        .configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false)
}