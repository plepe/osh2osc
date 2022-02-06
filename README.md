# osh2osc
Convert an OpenStreetMap .osc (OSM with History) to .osc (OSM Changeset)

## What is this script
I wanted to load a regional extract of [OpenStreetMap](https://openstreetmap.org) with attic data into an [Overpass API](http://overpass-api.de/) database (with attic data enabled). For this, you have to use a .osc (resp. .osc.bz2 or .osc.pbf) file. Unfortunately, the conversion from .osh to .osc with osmium-tool or osmconvert produces an output which would not work in Overpass API, because the changes would not be chronologically (first all nodes, then all ways, then all relations).

This little program would order the items in the correct order for Overpass API to work. It might not be very efficient though. There's also no support for pbf resp. bz2 (pull requests welcome!).

## Installation
```
git clone https://github.com/plepe/osh2osc
cd osh2osc
npm -g install
```

## Usage
To get a regional extract, you can use the full history dumps from [Geofabrik](https://osm-internal.download.geofabrik.de/).

You can cut them even further by using [osmium](https://osmcode.org/osmium-tool/):
```
osmium extract --with-history -b 16.33976,48.20232,16.34088,48.20320 country-internal.osh.pbf -o tmp1.osh.pbf
osmium tags-filter tmp1.osh.pbf wr/building nwr/amenity nwr/shop -o tmp2.osh.pbf
osmium getid --add-referenced --id-osm-file tmp2.osh.pbf --with-history tmp1.osh.pbf -o final.osh
```

Now, convert the final.osh to several files in the final directory:
```
osh2osc -i final.osh -o final
```

Create an Overpass API database:
```
for i in final/*.osc ; do cat $i | update_database --db-dir=database --keep-attic ; done
```

Example query:
```
echo '[out:json][date:"2011-01-01T00:00:00Z"];way(86127691);out meta geom;' | osm3s_query --db-dir=database
```

## Contributors
* Stephan Bösch-Plepelits
