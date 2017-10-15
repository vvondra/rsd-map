package cz.vojtechvondra.rsd

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
class DataController(val provider: DataProvider) {

    @GetMapping("/")
    fun data(
        @RequestParam("region", required = false) region: List<String>?,
        @RequestParam("poiType", required = false) poiType: String?,
        @RequestParam("road", required = false) road: String?
    ) = provider.toGeoJson(provider.findData(
        region ?: emptyList(),
        poiType,
        road
    ))

    @GetMapping("/roads")
    fun roads() = provider.roads

    @GetMapping("/regions")
    fun regions() = provider.regions

}
