package cz.vojtechvondra.rsd

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class DataController(val provider: DataProvider) {

    @GetMapping("/api/projects")
    fun data(
        @RequestParam("region", required = false) region: List<String>?,
        @RequestParam("poiType", required = false) poiType: String?,
        @RequestParam("road", required = false) road: List<String>?,
        @RequestParam("status", required = false) status: List<String>?
    ) = provider.toGeoJson(provider.findData(
        region ?: emptyList(),
        poiType,
        road ?: emptyList(),
        status ?: emptyList()
    ))

    @GetMapping("/api/roads")
    fun roads() = provider.roads

    @GetMapping("/api/regions")
    fun regions() = provider.regions

    @GetMapping("/api/plans")
    fun plans() = provider.plans

    @GetMapping("/api/projects/{id}")
    fun project(@PathVariable("id") id: String) = provider.getProject(id)

    @GetMapping("/api/statuses")
    fun statuses() = provider.findData().mapNotNull { t -> t.construction?.status }.distinct()

}
