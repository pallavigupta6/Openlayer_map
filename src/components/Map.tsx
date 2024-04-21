"use client";
// Importing necessary modules from React and OpenLayers
import { useEffect, useRef, useState } from "react";
import "ol/ol.css";
import OlMap from "ol/Map";
import View from "ol/View";
import { Draw } from "ol/interaction";
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Type } from "ol/geom/Geometry";

// Defining a functional component named Map
const Map = ({}) => {
  // state to store selected geometry type
  const [type, setType] = useState<string>("None");

  // Creating references for the map container, source, draw interaction, and the OpenLayers map
  const mapContainer = useRef<HTMLDivElement>(null);
  const source = useRef(new VectorSource({ wrapX: false }));
  const draw = useRef<Draw | null>(null);
  const olMap = useRef<OlMap | null>(null);

  // Function to handle change in drawing type
  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value as Type | "None";
    setType(selectedType);
    olMap.current?.removeInteraction(draw.current!);

    // If 'None' is selected, return and do not add any draw interaction
    if (selectedType === "None") {
      return;
    }

    // Create a new draw interaction based on the selected type
    draw.current = new Draw({
      source: source.current,
      type: selectedType,
    });

    // Add the draw interaction to the map
    olMap.current?.addInteraction(draw.current);
  };

  // Effect hook to create the map when the component mounts
  useEffect(() => {
    if (!mapContainer.current) {
      return;
    }

    // Creating vector layer with the vector source
    const vector = new VectorLayer({
      source: source.current,
    });

    // Creating the OpenLayers map
    olMap.current = new OlMap({
      layers: [
        new TileLayer({
          source: new OSM(), // Adding OpenStreetMap as base layer
        }),
        vector, // Adding the vector layer
      ],
      view: new View({
        // Setting the initial view of the map
        center: [8546575.886939, 2137169.681579], // Longitude, Latitude
        zoom: 6,
      }),
    });

    // Setting the map target to the map container
    olMap.current.setTarget(mapContainer.current);

    // Cleanup function to remove the map target when the component unmounts
    return () => {
      olMap.current?.setTarget(undefined);
    };
  }, []);
  // Rendering the map component
  return (
    <div className="map col-6">
      <h1>Drawing</h1>
      <div ref={mapContainer} className="w-100 h-75" />{" "}
      {/* Container for the map */}
      <div className="mt-2">
        <label htmlFor="type">Select Type</label>
        {/* Dropdown to select drawing type */}
        <select className="ms-3" value={type} onChange={handleTypeChange}>
          <option value="Point">Point</option>
          <option value="LineString">LineString</option>
          <option value="Polygon">Polygon</option>
          <option value="Circle">Circle</option>
          <option value="None">None</option>
        </select>
      </div>
    </div>
  );
};
// Exporting the Map component as default
export default Map;
