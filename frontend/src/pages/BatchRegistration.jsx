import { useState } from "react";
import Navbar from "../components/Navbar";

function BatchRegistration() {
  const [serials, setSerials] =
    useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(serials);
  };

  return (
    <div>
        <Navbar />
      <h1>Batch Registration</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          rows="10"
          cols="50"
          placeholder="Paste serial numbers here..."
          value={serials}
          onChange={(e) =>
            setSerials(e.target.value)
          }
        />

        <br />
        <br />

        <button type="submit">
          Register Batch
        </button>
      </form>
    </div>
  );
}

export default BatchRegistration;