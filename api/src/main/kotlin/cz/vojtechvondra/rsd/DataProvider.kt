package cz.vojtechvondra.rsd

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.module.kotlin.readValue
import okhttp3.OkHttpClient
import okhttp3.Request
import org.geojson.Feature
import org.geojson.FeatureCollection
import org.geojson.GeoJsonObject
import org.geojson.Point
import org.springframework.stereotype.Component
import java.time.OffsetDateTime
import java.util.stream.Collectors.toList

@Component
class DataProvider {

    private val client = OkHttpClient()

    private val data: List<Project> = DataMapper.jackson
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("data.json"))

    val regions: List<Region> = DataMapper.jackson
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("region.json"))

    val roads: List<Road> = DataMapper.jackson
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("road.json"))

    val plans: FeatureCollection = DataMapper.jackson
        .readValue(DataProvider::class.java.classLoader.getResourceAsStream("construction.json"))

    fun findData(region: List<String>, poiType: String?, road: String?): List<Project> {
        return data.stream()
            .filter { t -> t.poiType == "construction" }
            .filter { t -> region.isEmpty() || t.regions.intersect(region).count() > 0 }
            .filter { t -> poiType == null || t.poiType == poiType }
            .filter { t -> road == null || t.road._id == road }
            .filter { t -> t.published }
            .collect(toList())
    }

    fun getProject(id: String): Project {
        val rawData = client.newCall(Request.Builder().url("https://www.rsd.cz/mapa/api/poi/" + id).build())
            .execute()
            .body()!!
            .string()

        val rawAttachmentData = client.newCall(Request.Builder().url("https://www.rsd.cz/mapa/api/attachment?poi=" + id).build())
            .execute()
            .body()!!
            .string()

        val project: Project = DataMapper.jackson.readValue(rawData)
        project.attachments.addAll(DataMapper.jackson.readValue(rawAttachmentData))

        return project
    }

    fun toGeoJson(projects: List<Project>): GeoJsonObject {
        val collection = FeatureCollection()

        collection.addAll(
            projects.map { project ->
                val feature = Feature()
                feature.id = project._id
                feature.geometry = Point(project.gMarker.lng, project.gMarker.lat)
                feature.setProperty("id", project._id)
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

data class Construction(val code: String?, val status: String)

data class Attachment(
    val id: String,
    val isImage: Boolean,
    val published: Boolean,
    val convertedName: String,
    val size: Long,
    val poi: String,
    val name: String
) {
    @JsonProperty
    fun downloadLink() = "https://www.rsd.cz/mapa/attachment/$poi/$convertedName"
}

data class Project(
    val _id: String,
    val modifiedOn: OffsetDateTime,
    val europeanUnionFund: Boolean,
    val published: Boolean,
    val road: Road,
    val construction: Construction?,
    val regions: List<String>,
    private val description: Map<String, String> = emptyMap(),
    private val title: Map<String, String>,
    val poiType: String,
    val gMarker: Coords,
    val mapImage: String?,
    val attachments: MutableList<Attachment> = mutableListOf()
) {
    @JsonProperty
    fun defaultTitle() = title[title.keys.first()]
    @JsonProperty
    fun defaultDescription() = if (description.count() > 0) description[description.keys.first()] else ""
}