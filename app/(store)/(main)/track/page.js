import TrackForm from "../../../../components/store/TrackForm";

export const metadata = { title: "Захиалга шалгах" };

export default function TrackPage() {
  return (
    <div className="container container-narrow">
      <header className="page-head">
        <h1>Захиалга шалгах</h1>
        <p className="muted">Захиалгын дугаар болон захиалга өгөхдөө бичсэн утасны дугаараа оруулна уу.</p>
      </header>
      <TrackForm />
    </div>
  );
}
