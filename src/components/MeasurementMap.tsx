"use client";
import { useState, useRef, useEffect } from "react";
import View from "ol/View";
import OlMap from "ol/Map.js";
import Overlay from "ol/Overlay.js";
import { Draw } from "ol/interaction";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import { Type } from "ol/geom/Geometry";
import { getArea, getLength } from "ol/sphere";
import { LineString, Polygon } from "ol/geom";
import { OSM, Vector as VectorSource } from "ol/source";
import { unByKey } from "ol/Observable";

const MeasurementMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<string>("");
  const source = useRef(new VectorSource());
  const draw = useRef<Draw | null>(null);
  const olMap = useRef<OlMap | null>(null);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = event.target.value;
    setType(selectedType);
    draw.current = new Draw({
      source: source.current,
      type: selectedType === "area" ? "Polygon" : "LineString",
    });

    olMap.current?.addInteraction(draw.current);
  };

  // Calculation of line & Polygon
  const formatLength = (line: LineString) => {
    const length = getLength(line);
    return length > 100
      ? `${(length / 1000).toFixed(2)} km`
      : `${length.toFixed(2)} m`;
  };

  const formatArea = (polygon: Polygon) => {
    const area = getArea(polygon);
    return area > 10000
      ? `${(area / 1000000).toFixed(2)} km²`
      : `${area.toFixed(2)} m²`;
  };

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

        new VectorLayer({
          source: source.current,
        }),
      ],
      view: new View({
        center: [-11000000, 4600000],
        zoom: 10,
      }),
    });
    olMap.current.setTarget(mapContainer.current);
    return () => {
      olMap.current?.setTarget(undefined);
    };
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: "65rem", height: "36rem" }}
      />
      <div>
        <select value={type} onChange={handleTypeChange}>
          <option value="length">LineString</option>
          <option value="area">Polygon</option>
        </select>
      </div>
    </>
  );
};

export default MeasurementMap;
