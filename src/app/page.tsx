import Map from "@/components/Map";
import MeasurementMap from "@/components/MeasurementMap";

export default function Home() {
  return (
    <main className="container">
      <div className="col-12 d-flex">
        <div className="col-6">
      <Map />
      </div>
      <div className="col-6">
      <MeasurementMap/>
      </div>
      </div>
    </main>
  );
}
