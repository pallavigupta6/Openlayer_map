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
import Sketch from "ol//Feature";
import MapBrowserEvent from "ol/MapBrowserEvent";
import { EventsKey } from "ol/events";
import { Coordinate } from "ol/coordinate";

const MeasurementMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const [type, setType] = useState<string>("");
  const source = useRef(new VectorSource());
  const draw = useRef<Draw | null>(null);
  const olMap = useRef<OlMap | null>(null);
  const sketch = useRef<Sketch | null>(null);
  const helpTooltipElement = useRef<HTMLElement | null>(null);
  const helpTooltip = useRef<Overlay | null>(null);
  const measureTooltipElement = useRef<HTMLElement | null>(null);
  const measureTooltip = useRef<Overlay | null>(null);

  const pointerMoveHandler = function (e: MapBrowserEvent<UIEvent>) {
    if (e.dragging) {
      return;
    }
    let helpMsg = "Click to start drawing";

    if (sketch.current) {
      const geom = sketch.current?.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = "Click to continue drawing the polygon";
      } else if (geom instanceof LineString) {
        helpMsg = "Click to continue drawing the line";
      }
    }
    if (helpTooltipElement.current)
      helpTooltipElement.current.innerHTML = helpMsg;
    helpTooltip.current?.setPosition(e.coordinate);
    console.info("help", helpTooltipElement.current);

    helpTooltipElement.current?.classList.remove("hidden");
  };

  const createHelpTooltip = () => {
    if (helpTooltipElement.current) {
      helpTooltipElement.current?.parentNode?.removeChild(
        helpTooltipElement.current
      );
    }
    helpTooltipElement.current = document.createElement("div");
    helpTooltipElement.current!.className = "ol-tooltip hidden";
    helpTooltip.current = new Overlay({
      element: helpTooltipElement.current,
      offset: [15, 0],
      positioning: "center-left",
    });
    olMap.current?.addOverlay(helpTooltip.current);
    console.info(measureTooltip.current);
  };

  const createMeasureTooltip = () => {
    if (measureTooltipElement.current) {
      measureTooltipElement.current?.parentNode?.removeChild(
        measureTooltipElement.current
      );
    }
    measureTooltipElement.current = document.createElement("div");
    measureTooltipElement.current.className = "ol-tooltip ol-tooltip-measure";
    measureTooltip.current = new Overlay({
      element: measureTooltipElement.current,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
      insertFirst: false,
    });
    console.info(measureTooltip.current);
    olMap.current?.addOverlay(measureTooltip.current);
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    olMap.current?.removeInteraction(draw.current!);
    const selectedType = event.target.value;
    setType(selectedType);
    draw.current = new Draw({
      source: source.current,
      type: selectedType === "area" ? "Polygon" : "LineString",
    });

    olMap.current?.addInteraction(draw.current);
    createMeasureTooltip();
    createHelpTooltip();

    let listener: EventsKey | undefined;
    draw.current.on("drawstart", function (e) {
      // set sketch
      sketch.current = e.feature;
      console.info("e", e);

      let tooltipCoord: Coordinate;

      listener = sketch.current?.getGeometry()?.on("change", function (evt) {
        const geom = evt.target;
        let output;
        if (geom instanceof Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }

        if (measureTooltipElement.current)
          measureTooltipElement.current.innerHTML = output ?? "";
        measureTooltip.current?.setPosition(tooltipCoord);
      });
    });

    draw.current.on("drawend", function () {
      measureTooltipElement.current!.className = "ol-tooltip ol-tooltip-static";
      measureTooltip.current?.setOffset([0, -7]);
      // unset sketch
      sketch.current = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement.current = null;
      createMeasureTooltip();
      unByKey(listener!);
    });
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
        vector,
      ],
      view: new View({
        center: [8546575.886939, 2137169.681579],
        zoom: 6,
      }),
    });
    olMap.current.setTarget(mapContainer.current);

    olMap.current.on("pointermove", pointerMoveHandler);

    olMap.current.getViewport().addEventListener("mouseout", function () {
      helpTooltipElement.current?.classList.add("hidden");
    });

    return () => {
      olMap.current?.setTarget(undefined);
    };
  }, []);

  return (
    <div className="map col-6">
      <h1>Measurement</h1>
      <div className="w-100 h-75" ref={mapContainer} />
      <div className="mt-2">
        <label htmlFor="type">Select Type</label>
        <select className="ms-3" value={type} onChange={handleTypeChange}>
          <option value="">None</option>
          <option value="length">LineString</option>
          <option value="area">Polygon</option>
        </select>
      </div>
    </div>
  );
};

export default MeasurementMap;
