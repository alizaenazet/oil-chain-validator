import { useParams } from "react-router-dom";

function Verify() {
  const { serialNumber } = useParams();

  return (
    <div>
      <h1>Verify Product</h1>

      <p>
        Serial Number:
        {serialNumber}
      </p>
    </div>
  );
}

export default Verify;