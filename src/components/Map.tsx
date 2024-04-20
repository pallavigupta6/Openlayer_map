"use client";
import { useEffect, useRef ,useState} from "react";
import "ol/ol.css";
import OlMap from "ol/Map";
import View from "ol/View";
import { Draw } from "ol/interaction";
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Type } from "ol/geom/Geometry";

const Map = ({}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const [type, setType] = useState<string>("None");
    const source = useRef(new VectorSource({ wrapX: false }));

    const draw = useRef<Draw|null>(null);
    const olMap = useRef<OlMap|null>(null);

// let draw;
  // on component mount create the map and set the map refrences to the state
  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

    const vector = new VectorLayer({
      source: source.current,
    });

    olMap.current = new OlMap({
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vector,
      ],
      view: new View({
        //Coordinate System: WGS 84 / Pseudo-Mercator-EPSG:3857
        center: [8546575.886939, 2137169.681579], // Longitude, Latitude
        zoom: 6,
      }),
    });


    olMap.current.setTarget(mapContainer.current);
  
    // on component unmount remove the map refrences to avoid unexpected behaviour
    return () => {
        olMap.current?.setTarget(undefined);
    };
  }, []);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value as Type|'None';
    setType(selectedType);
    olMap.current?.removeInteraction(draw.current!);

    if (selectedType === 'None') {
      return;
    } 
      draw.current = new Draw({
        source: source.current,
        type: selectedType,
      });

      olMap.current?.addInteraction(draw.current);
    }
  
  return (
    <>
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: "65rem", height: "36rem" }}
      />
      <div>
        <select value={type} onChange={handleTypeChange}>
        <option value="Point">Point</option>
            <option value="LineString">LineString</option>
            <option value="Polygon">Polygon</option>
            <option value="Circle">Circle</option>
            <option value="None">None</option>

        </select>
      </div>
    </>
  );
};
export default Map;
