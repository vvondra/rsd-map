# ŘSD Map Application Reloaded

This is a hastily built UI for the [Map Application](https://www.rsd.cz/wps/portal/web/mapa-projektu#/) provided by Ředitelství silnic a dálnic.

It plots the planned constructions of Highways and First Class Roads.

The UI is build is using Mapbox GL, React Map GL and has a small Spring Boot proxy transforming the original source data.


## Data

### Projects

All the map markers, labels and attachment links are downloaded from the ŘSD website and their API.

### Planned roads

Planned roads are not part of the Mapbox Layers, so they are exported from OpenStreetMaps and added add as an additional data layer.

1. Download Czech full [OSM data](http://download.geofabrik.de/europe/czech-republic.html)
2. Convert to OSM: `osmconvert czech-republic-latest.osm.pbf -o=cz.osm`
3. Filter out planned routes and constructions: `osmfilter cz.osm --keep="highway=proposed =construction" > cz.plans.osm`
4. Convert to GeoJSON: `osmtogeojson cz.plans.osm > cz.plans.geojson`
5. Filter out some noise in GeoJSON: `cat cz.plans.geojson | jq -c 'map(select(.geometry.type == "LineString"))' > cz.plans.clean.geojson`